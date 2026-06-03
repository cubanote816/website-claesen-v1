import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { ui, defaultLang } from '../i18n/ui';

interface Props {
    lang?: keyof typeof ui;
}

export default function CookieConsent({ lang = defaultLang }: Props) {
    const t = ui[lang] || ui[defaultLang];
    const [isVisible, setIsVisible] = useState(false);

    const baseUrl = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
    const privacyUrl = `${baseUrl}${lang === defaultLang ? '/privacy' : `/${lang}/privacy`}`;

    useEffect(() => {
        const consent = Cookies.get('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set('cookie-consent', 'accepted', { expires: 365, secure: true, sameSite: 'strict' });
        setIsVisible(false);
    };

    const handleDecline = () => {
        Cookies.set('cookie-consent', 'declined', { expires: 365, secure: true, sameSite: 'strict' });
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className="fixed bottom-6 right-6 z-[60] max-w-sm w-[90vw]"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gunmetal/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-lux-gold/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-full bg-white/5 border border-white/10 text-lux-gold">
                                    <Cookie className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="text-cool-slate hover:text-white transition-colors"
                                    aria-label="Sluiten"
                                >
                                    <X className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>

                            <h3 className="text-white font-display font-bold text-lg mb-2">
                                {t['cookie.title']}
                            </h3>
                            <p className="text-cool-slate text-sm leading-relaxed mb-6">
                                {t['cookie.text']}{' '}
                                <a href={privacyUrl} className="text-lux-gold hover:underline">
                                    {t['cookie.policy']}
                                </a>.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 py-3 px-4 bg-lux-gold text-obsidian font-bold text-sm rounded-xl hover:bg-white hover:text-obsidian transition-colors shadow-lg shadow-lux-gold/10"
                                >
                                    {t['cookie.accept']}
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 py-3 px-4 bg-white/5 text-white font-medium text-sm rounded-xl hover:bg-white/10 border border-white/5 transition-colors"
                                >
                                    {t['cookie.decline']}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
