import React, { useState, useEffect } from 'react'
import { portfolioService } from '../services/portfolio'
import { ui, defaultLang } from '../i18n/ui'

interface ContentState {
    bodyText: string
    challenge: string
    solution: string
    result: string
}

interface Props {
    slug: string
    lang?: string
    initial: ContentState
}

function isEmpty(html: string): boolean {
    return !html || html.replace(/<[^>]*>/g, '').trim() === ''
}

export default function ProjectLiveContent({ slug, lang = defaultLang, initial }: Props) {
    const t = ui[lang as keyof typeof ui] || ui[defaultLang]
    const [data, setData] = useState<ContentState>(initial)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        portfolioService.getProject(slug).then(project => {
            const get = (val: any): string => {
                if (typeof val === 'string') return val
                if (!val) return ''
                return val[lang] || val['nl'] || val['en'] || ''
            }
            const workStory   = get(project.work_story)
            const description = get(project.description)
            const bodyText    = workStory || description
            const challenge   = get(project.challenge)
            const solution    = get(project.solution)
            const result      = get(project.result)

            if (bodyText || challenge || solution || result) {
                setData({ bodyText, challenge, solution, result })
            }
        }).catch(() => {}).finally(() => setReady(true))
    }, [slug])

    const { bodyText, challenge, solution, result } = data

    return (
        <>
            {!isEmpty(bodyText) && (
                <section className="py-16 border-b border-white/[0.06]">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10 lg:gap-14 items-start">
                        <article>
                            <p className="text-lux-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                                {t['project.workdetails.story']}
                            </p>
                            <h2 className="font-display text-[32px] font-bold text-white mb-6 leading-tight">
                                {t['project.workdetails.title']}
                            </h2>
                            <div
                                className="text-white/70 text-[17px] leading-[1.85] max-w-[720px] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-white"
                                dangerouslySetInnerHTML={{ __html: bodyText }}
                            />
                        </article>
                        <aside className="lg:sticky lg:top-24">
                            <div className="border border-white/10 bg-[#121419] rounded-lg p-6">
                                <h3 className="font-bold text-[15px] text-white mb-3 leading-snug">
                                    {t['services.cta.title']}
                                </h3>
                                <p className="text-white/50 text-[14px] leading-relaxed mb-5">
                                    {t['contact.subtitle']}
                                </p>
                                <a href={`${lang !== 'nl' ? `/${lang}` : ''}/#contact`}
                                   className="block w-full text-center px-4 py-3 rounded-lg bg-white/6 border border-white/12 text-white font-bold text-[12px] uppercase tracking-wide hover:border-lux-gold/40 hover:text-lux-gold transition-colors">
                                    {t['nav.cta']}
                                </a>
                            </div>
                        </aside>
                    </div>
                </section>
            )}

            {(!isEmpty(challenge) || !isEmpty(solution) || !isEmpty(result)) && (
                <section className="py-16 border-b border-white/[0.06]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {!isEmpty(challenge) && (
                            <div className="border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-lg p-6 min-h-[220px]">
                                <div className="w-[38px] h-[38px] grid place-items-center mb-7 border border-lux-gold/30 rounded-lg bg-lux-gold/8">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-lux-gold">
                                        <path d="M12 3v18M3 12h18"/><path d="m5 5 14 14M19 5 5 19"/>
                                    </svg>
                                </div>
                                <h3 className="text-lux-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                                    {t['project.workdetails.challenge']}
                                </h3>
                                <div className="text-white/65 text-[14px] leading-[1.72] [&_p]:mb-2 [&_p:last-child]:mb-0"
                                     dangerouslySetInnerHTML={{ __html: challenge }} />
                            </div>
                        )}
                        {!isEmpty(solution) && (
                            <div className="border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-lg p-6 min-h-[220px]">
                                <div className="w-[38px] h-[38px] grid place-items-center mb-7 border border-lux-gold/30 rounded-lg bg-lux-gold/8">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-lux-gold">
                                        <path d="M4 13a8 8 0 1 1 16 0"/><path d="M12 21v-8"/><path d="M8 17h8"/>
                                    </svg>
                                </div>
                                <h3 className="text-lux-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                                    {t['project.workdetails.solution']}
                                </h3>
                                <div className="text-white/65 text-[14px] leading-[1.72] [&_p]:mb-2 [&_p:last-child]:mb-0"
                                     dangerouslySetInnerHTML={{ __html: solution }} />
                            </div>
                        )}
                        {!isEmpty(result) && (
                            <div className="border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-lg p-6 min-h-[220px]">
                                <div className="w-[38px] h-[38px] grid place-items-center mb-7 border border-lux-gold/30 rounded-lg bg-lux-gold/8">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-lux-gold">
                                        <path d="m20 6-11 11-5-5"/>
                                    </svg>
                                </div>
                                <h3 className="text-lux-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                                    {t['project.workdetails.result']}
                                </h3>
                                <div className="text-white/65 text-[14px] leading-[1.72] [&_p]:mb-2 [&_p:last-child]:mb-0"
                                     dangerouslySetInnerHTML={{ __html: result }} />
                            </div>
                        )}
                    </div>
                </section>
            )}
        </>
    )
}
