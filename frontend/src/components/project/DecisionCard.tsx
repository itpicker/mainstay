'use client';

import { DecisionOption, ReviewRequest } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Coins, ThumbsUp, ThumbsDown } from 'lucide-react';

interface DecisionCardProps {
    request: ReviewRequest;
    onSelectOption: (optionId: string) => void;
}

export function DecisionCard({ request, onSelectOption }: DecisionCardProps) {
    if (!request.options || request.options.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                {request.title}
                <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">
                    Decision Required
                </span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                {request.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {request.options.map((option) => (
                    <div
                        key={option.id}
                        className={cn("relative group border rounded-xl overflow-hidden transition-all duration-300",
                            request.selectedOptionId === option.id
                                ? "bg-purple-500/10 border-purple-500 ring-1 ring-purple-500"
                                : "bg-secondary/20 border-white/5 hover:border-purple-500/50 hover:bg-secondary/40"
                        )}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold">{option.title}</h4>
                                {request.selectedOptionId === option.id && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-purple-500 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground min-h-[40px]">{option.description}</p>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center divide-x divide-white/5 border-b border-white/5 bg-secondary/30">
                            <div className="flex-1 p-3 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Effort</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    {option.estimatedEffort}
                                </div>
                            </div>
                            <div className="flex-1 p-3 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cost</span>
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    <Coins className="h-4 w-4 text-orange-400" />
                                    {option.cost}
                                </div>
                            </div>
                        </div>

                        {/* Pros & Cons */}
                        <div className="p-5 space-y-4">
                            <div>
                                <h5 className="text-xs font-semibold text-green-500 mb-2 flex items-center gap-1.5">
                                    <ThumbsUp className="h-3.5 w-3.5" /> Pros
                                </h5>
                                <ul className="space-y-1">
                                    {option.pros.map((pro, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1.5">
                                    <ThumbsDown className="h-3.5 w-3.5" /> Cons
                                </h5>
                                <ul className="space-y-1">
                                    {option.cons.map((con, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-red-500 mt-1">•</span>
                                            {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Action */}
                        {!request.selectedOptionId && (
                            <div className="p-4 bg-secondary/30 border-t border-white/5">
                                <button
                                    onClick={() => onSelectOption(option.id)}
                                    className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 hover:border-purple-500 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                                >
                                    Select This Option
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
