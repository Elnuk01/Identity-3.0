import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { Registration } from '../types';
import { ShieldCheck, MessageSquare, Download, Flame, RefreshCw, HandHelping, Loader2 } from 'lucide-react';

interface SuccessPageProps {
  registration: Registration;
  darkMode: boolean;
  onReset: () => void;
}

export default function SuccessPage({ registration, darkMode, onReset }: SuccessPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);

  const { id, fullName, email, phoneNumber, churchName, ageRange, sex, volunteerOptions } = registration;

  const whatsAppLink = "https://chat.whatsapp.com/CibIPByTE89GOFfs6vhPql?s=cl&p=i&ilr=1";

  // QR Code payload
  const qrData = `ID:${id}\nName:${fullName}\nEmail:${email}\nPhone:${phoneNumber}\nChurch:${churchName || 'N/A'}\nAgeRange:${ageRange}\nSex:${sex}`;

  useEffect(() => {
    QRCode.toDataURL(
      qrData,
      {
        margin: 1,
        width: 180,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (err) {
          console.error('Error generating offline QR:', err);
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`);
        } else {
          setQrCodeUrl(url);
        }
      }
    );
  }, [qrData]);

  // Celebration Confetti particle canvas engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#00e5ff', '#a855f7', '#ff6b35', '#22c55e', '#ec4899'];
    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      dx: number;
      dy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const isLeft = i % 2 === 0;
      particles.push({
        x: isLeft ? 10 : width - 10,
        y: height - 60,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: isLeft ? Math.random() * 12 + 6 : -Math.random() * 12 - 6,
        dy: -Math.random() * 20 - 10,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        opacity: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        if (p.opacity <= 0.01) return;

        alive = true;
        p.dy += 0.4; // gravity
        p.rotation += p.rotationSpeed;
        p.x += p.dx;
        p.y += p.dy;

        if (p.y > height - 40) {
          p.opacity -= 0.02;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);

        ctx.restore();
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      // Small pause to allow UI thread to register downloading status
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(ticketRef.current, {
        backgroundColor: darkMode ? '#09090b' : '#ffffff',
        pixelRatio: 2, // retina density download for superb quality
        style: {
          transform: 'none',
          boxShadow: 'none',
        }
      });

      const link = document.createElement('a');
      link.download = `Gate-Pass-${id}-${fullName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image ticket:', error);
      alert('Could not download as image directly inside this context. Please capture a screenshot of your pass below.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section
      className={`relative min-h-screen py-16 flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-zinc-950 text-white' : 'bg-gradient-to-b from-slate-50 to-zinc-100 text-zinc-900'
      }`}
    >
      {/* High impact background confetti canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-50" />

      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 relative z-10 w-full">
        
        {/* Banner Headers */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 mb-4"
          >
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </motion.div>
          
          <span className="block font-mono text-[10px] font-black tracking-widest text-emerald-500 uppercase">
            REGISTRATION COMPLETED
          </span>
          <h2 className="font-display font-black text-2.5xl sm:text-4xl uppercase tracking-tight mt-1.5">
            CONGRATULATIONS{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              {fullName.split(' ')[0]}!
            </span>
          </h2>
          <p className={`text-xs mt-2 max-w-md mx-auto leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
            Your complimentary seat has been locked into the Teens Converge database. Make sure to download your gate pass image below.
          </p>
        </div>

        {/* Dynamic Ticket pass to be screenshotted/downloaded */}
        <div className="relative group">
          <motion.div
            ref={ticketRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border overflow-hidden p-6 sm:p-8 relative ${
              darkMode
                ? 'bg-zinc-900 border-zinc-805/85 shadow-2xl shadow-blue-500/5 text-white'
                : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 text-zinc-900'
            }`}
          >
            {/* Card Accent Lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />

            {/* Ticket Header */}
            <div className="flex justify-between items-start pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 mb-6">
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="font-display font-black text-sm uppercase tracking-wide">
                    TEENS CONVERGE
                  </span>
                </div>
                <p className="text-[9px] font-mono tracking-widest uppercase text-blue-500 font-bold mt-0.5">
                  IDENTITY 3.0
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                  PASS ID
                </span>
                <span className="font-mono font-black text-sm text-blue-500 dark:text-blue-400">
                  {id}
                </span>
              </div>
            </div>

            {/* Ticket Body details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                    ATTENDEE NAME
                  </span>
                  <span className="font-display font-bold text-lg uppercase leading-none block">
                    {fullName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                      EMAIL ADDRESS
                    </span>
                    <span className="text-xs font-semibold leading-none font-mono truncate block max-w-full" title={email}>
                      {email}
                    </span>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                      PHONE NUMBER
                    </span>
                    <span className="text-xs font-semibold leading-none font-mono">
                      {phoneNumber}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                      CHURCH DELEGATION
                    </span>
                    <span className="text-xs font-semibold leading-none truncate block">
                      {churchName || 'Not Specified'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                      ORGANIZATION PROFILE
                    </span>
                    <span className="text-xs font-semibold leading-none">
                      Age range: {ageRange} • {sex}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-wider mb-0.5">
                      VOLUNTEER CHOICE
                    </span>
                    <span className="text-xs font-bold leading-none capitalize text-indigo-500">
                      {volunteerOptions.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <HandHelping className="w-3 h-3 text-indigo-500" />
                          {volunteerOptions.join(', ')}
                        </span>
                      ) : (
                        'Attendee'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code section */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-zinc-100 max-w-[150px] mx-auto w-full shadow-inner">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Verification QR Code"
                    className="w-full aspect-square object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                )}
                <span className="block text-[8px] font-mono text-zinc-900 font-bold tracking-wider mt-1.5 uppercase text-center">
                  CHECK-IN PASS
                </span>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[9px] font-mono text-zinc-500 text-center uppercase tracking-widest leading-none">
              ||||| | ||||| | || ||||| | ||| • COMPLIMENTARY REGISTERED VIP PASS
            </div>
          </motion.div>
        </div>

        {/* Download Gate Pass Trigger (MANDATE: Gate pass should be a downloadable image) */}
        <div className="mt-4 mb-8">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white font-mono text-xs font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/10 tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>GENERATING IMAGE PASS...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white animate-bounce" />
                <span>DOWNLOAD GATE PASS (PNG IMAGE)</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Group Box (USER EXPLICIT MANDATE) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 sm:p-6 mb-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4.5"
        >
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <MessageSquare className="w-6 h-6 fill-white stroke-none" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-emerald-500">
              Join the WhatsApp Group
            </h3>
            <p className={`text-xs leading-relaxed mt-1 ${darkMode ? 'text-zinc-300' : 'text-zinc-650'}`}>
              Join our exclusive WhatsApp community to receive important event schedules, interactive updates, and direct event information.
            </p>
          </div>
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center shrink-0 py-3 px-5 text-xs font-mono font-bold tracking-wider uppercase text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md hover:shadow-emerald-500/15 transition-all cursor-pointer"
          >
            JOIN WHATSAPP GROUP
          </a>
        </motion.div>

        {/* Action button to reset */}
        <div className="text-center space-y-4">
          <button
            onClick={onReset}
            className={`py-3 px-6 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 mx-auto border cursor-pointer ${
              darkMode
                ? 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5'
                : 'bg-transparent border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Register Another Person</span>
          </button>
        </div>

      </div>
    </section>
  );
}
