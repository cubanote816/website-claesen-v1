import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { consultationService } from '../services/consultation';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { ui, defaultLang } from '../i18n/ui';

interface Props {
    lang?: keyof typeof ui;
}

export default function ContactForm({ lang = defaultLang }: Props) {
    const t = ui[lang] || ui[defaultLang];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        projectType: '',
        preferredContact: 'email'
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            await consultationService.sendConsultation({
                ...formData,
                type: 'consultation',
            });
            setStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                message: '',
                projectType: '',
                preferredContact: 'email'
            });
        } catch (error: any) {
            console.error('Submission error:', error);
            setStatus('error');
            setErrorMessage(error.message || t['form.error']);
        }
    };

    return (
        <div className="w-full bg-gunmetal/50 backdrop-blur-xl border border-white/5 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-lux-gold/5 rounded-bl-[100px] pointer-events-none"></div>

            <h3 className="font-display text-2xl font-bold mb-8 relative z-10 text-white">{t['contact.title']}</h3>

            {status === 'success' ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold font-display mb-2">{t['form.success.title']}</h3>
                    <p className="text-cool-slate">{t['form.success.text']}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-8 text-lux-gold hover:text-white transition-colors text-sm font-medium"
                    >
                        {t['form.success.button']}
                    </button>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-cool-slate mb-2">{t['form.name']} *</label>
                            <input
                                type="text"
                                id="name"
                                required
                                placeholder={t['form.name.placeholder']}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors placeholder:text-cool-slate/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-cool-slate mb-2">{t['form.email']} *</label>
                            <input
                                type="email"
                                id="email"
                                required
                                placeholder={t['form.email.placeholder']}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors placeholder:text-cool-slate/50"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-cool-slate mb-2">{t['form.phone']}</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder={t['form.phone.placeholder']}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors placeholder:text-cool-slate/50"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-bold text-cool-slate mb-2">{t['form.company']}</label>
                            <input
                                type="text"
                                id="company"
                                placeholder={t['form.company.placeholder']}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors placeholder:text-cool-slate/50"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="projectType" className="block text-sm font-bold text-cool-slate mb-2">{t['form.projectType']}</label>
                        <select
                            id="projectType"
                            className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors appearance-none"
                            value={formData.projectType}
                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        >
                            <option value="" disabled>{t['form.projectType.placeholder']}</option>
                            <option value="sport">{t['form.projectType.sport']}</option>
                            <option value="industrial">{t['form.projectType.industrial']}</option>
                            <option value="public">{t['form.projectType.public']}</option>
                            <option value="other">{t['form.projectType.other']}</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-bold text-cool-slate mb-2">{t['form.message']} *</label>
                        <textarea
                            id="message"
                            required
                            rows={4}
                            placeholder={t['form.message.placeholder']}
                            className="w-full bg-obsidian border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lux-gold focus:ring-1 focus:ring-lux-gold transition-colors resize-none placeholder:text-cool-slate/50"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div>
                        <span className="block text-sm font-bold text-cool-slate mb-2">{t['form.preferred']}</span>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="preferredContact"
                                    value="email"
                                    checked={formData.preferredContact === 'email'}
                                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                                    className="w-4 h-4 text-lux-gold border-white/30 focus:ring-lux-gold bg-obsidian"
                                />
                                <span className="text-sm text-cool-slate group-hover:text-white transition-colors">{t['form.email']}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="preferredContact"
                                    value="phone"
                                    checked={formData.preferredContact === 'phone'}
                                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                                    className="w-4 h-4 text-lux-gold border-white/30 focus:ring-lux-gold bg-obsidian"
                                />
                                <span className="text-sm text-cool-slate group-hover:text-white transition-colors">{t['form.phone']}</span>
                            </label>
                        </div>
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            <AlertCircle className="w-4 h-4" />
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full bg-lux-gold text-obsidian font-bold py-4 rounded-xl hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-lux-gold/10"
                    >
                        {status === 'submitting' ? (
                            <div className="w-5 h-5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> {t['form.submit']}
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
