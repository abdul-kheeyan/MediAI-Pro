import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff, User, Settings, Shield, Maximize2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const VideoCall = () => {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef();
    const socket = useRef();
    const remotePeerId = useRef(null);
    const pendingCandidates = useRef([]); // ICE Queue
    const userRef = useRef(user); // Fix stale closure for handleHangup

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        const initCall = async () => {
            try {
                socket.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);

                // Standard way to handle refs in WebRTC to avoid race conditions
                const setVideoRef = (ref, mediaStream) => {
                    if (ref.current && mediaStream) {
                        ref.current.srcObject = mediaStream;
                    }
                };

                setVideoRef(localVideoRef, stream);

                const createPeer = () => {
                    const pc = new RTCPeerConnection({
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' },
                            { urls: 'stun:stun3.l.google.com:19302' },
                            { urls: 'stun:stun4.l.google.com:19302' }
                        ]
                    });

                    // Add local tracks to the connection
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    pc.ontrack = (event) => {
                        console.log('Received remote track:', event.track.kind);
                        // Some browsers use event.streams, others use event.track
                        const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);

                        setRemoteStream(prev => {
                            if (prev && prev.id === stream.id) return prev;
                            return stream;
                        });

                        setIsConnecting(false);
                    };

                    pc.onicecandidate = (event) => {
                        if (event.candidate && remotePeerId.current) {
                            socket.current.emit('ice-candidate', {
                                to: remotePeerId.current,
                                candidate: event.candidate
                            });
                        }
                    };

                    pc.oniceconnectionstatechange = () => {
                        console.log('ICE Connection State:', pc.iceConnectionState);
                        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                            // Optionally handle reconnection logic here
                        }
                    };

                    return pc;
                };

                peerConnection.current = createPeer();

                const processQueue = async () => {
                    if (pendingCandidates.current.length > 0) {
                        console.log(`Processing ${pendingCandidates.current.length} queued candidates`);
                        while (pendingCandidates.current.length > 0) {
                            const candidate = pendingCandidates.current.shift();
                            try {
                                if (peerConnection.current && peerConnection.current.remoteDescription) {
                                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                                }
                            } catch (e) {
                                console.warn('Error adding queued ICE candidate:', e);
                            }
                        }
                    }
                };

                socket.current.on('user-joined', async (peerId) => {
                    console.log('User joined call:', peerId);
                    remotePeerId.current = peerId;
                    try {
                        const offer = await peerConnection.current.createOffer();
                        await peerConnection.current.setLocalDescription(offer);
                        socket.current.emit('offer', { to: peerId, offer });
                    } catch (e) {
                        console.error('Error creating offer:', e);
                    }
                });

                socket.current.on('offer', async ({ from, offer }) => {
                    console.log('Received offer from:', from);
                    remotePeerId.current = from;
                    try {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await peerConnection.current.createAnswer();
                        await peerConnection.current.setLocalDescription(answer);
                        socket.current.emit('answer', { to: from, answer });
                        await processQueue();
                    } catch (e) {
                        console.error('Error handling offer:', e);
                    }
                });

                socket.current.on('answer', async ({ answer }) => {
                    console.log('Received answer');
                    try {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                        await processQueue();
                    } catch (e) {
                        console.error('Error handling answer:', e);
                    }
                });

                socket.current.on('ice-candidate', async ({ candidate }) => {
                    try {
                        if (peerConnection.current && peerConnection.current.remoteDescription) {
                            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                        } else {
                            pendingCandidates.current.push(candidate);
                        }
                    } catch (e) {
                        console.warn('Error adding ICE candidate:', e);
                    }
                });

                socket.current.on('user-left', () => {
                    handleHangup();
                });

                socket.current.emit('join-call', appointmentId);

            } catch (error) {
                console.error('WebRTC Error:', error);
                toast.error('Could not access camera/microphone. Please check browser permissions.');
            }
        };

        initCall();

        return () => {
            if (peerConnection.current) peerConnection.current.close();
            if (socket.current) socket.current.disconnect();
        };
    }, [appointmentId]);

    // Use effects to ensure video objects are attached after render
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (!localStream || localStream.getAudioTracks().length === 0) return;
        localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        if (!localStream || localStream.getVideoTracks().length === 0) return;
        localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
        setIsVideoOff(!isVideoOff);
    };

    const handleHangup = async () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        try {
            await api.put(`/appointments/${appointmentId}`, { status: 'completed' });
        } catch (error) {
            console.error('Failed to update appointment status:', error);
        }

        // Redirect both to the main dashboard route
        navigate('/dashboard');
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0f] z-[1000] flex flex-col font-sans overflow-hidden">
            {/* Minimal High-End Header */}
            <header className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-50 pointer-events-none">
                <div className="flex items-center gap-6 pointer-events-auto">
                    <button
                        onClick={handleHangup}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-white font-black tracking-tight text-lg">Live Consultation</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] text-emerald-400/80 uppercase font-black tracking-[0.2em]">P2P Encrypted Session</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="px-6 py-2.5 bg-indigo-600/20 backdrop-blur-md rounded-2xl border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest hidden md:block">
                        Ultra High Definition
                    </div>
                </div>
            </header>

            {/* Main Viewport */}
            <main className="flex-1 relative group cursor-none">
                {/* Remote Stream (Main Background) */}
                <div className="absolute inset-0 bg-black">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-indigo-500/20 rounded-full animate-ping"></div>
                                <div className="p-10 bg-indigo-600/10 rounded-full border border-indigo-500/30">
                                    <User size={60} className="text-indigo-500" />
                                </div>
                            </div>
                            <p className="text-white/40 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Waiting for peer to connect...</p>
                        </div>
                    )}
                </div>

                {/* Local Stream (PiP View) */}
                <motion.div
                    drag
                    dragConstraints={{ left: 20, right: 20, top: 20, bottom: 20 }}
                    className="absolute bottom-32 right-8 w-48 md:w-64 aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/10 z-40 group-hover:cursor-grab active:cursor-grabbing"
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">You</span>
                    </div>
                </motion.div>

                {/* Overlays/Controls Reveal on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/40 to-transparent flex justify-center items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="flex items-center gap-8 pointer-events-auto mb-4 scale-95 hover:scale-100 transition-transform">
                        <button
                            onClick={toggleMute}
                            className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all ${isMuted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20'}`}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20'}`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>

                        <button
                            onClick={handleHangup}
                            className="w-20 h-20 bg-rose-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-rose-600/40 hover:bg-rose-700 hover:scale-110 active:scale-95 transition-all"
                        >
                            <PhoneOff size={32} />
                        </button>

                        <button className="w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center hover:bg-white/20 transition-all">
                            <ScreenShare size={24} />
                        </button>

                        <button className="w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center hover:bg-white/20 transition-all">
                            <Settings size={24} />
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Status Bar */}
            <footer className="px-10 py-5 bg-black border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                        <Shield size={14} className="text-indigo-400" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center overflow-hidden">
                                <User size={14} className="text-slate-400" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2 Participants</span>
                </div>
            </footer>
        </div>
    );
};

export default VideoCall;
