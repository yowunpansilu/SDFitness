import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface MacroWheelProps {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    targetCalories?: number;
}

export function MacroWheel({ protein, carbs, fats }: MacroWheelProps) {
    // Calculate percentages for the nested rings
    const proteinCal = protein * 4;
    const carbsCal = carbs * 4;
    const fatsCal = fats * 9;
    const totalMacrosCal = proteinCal + carbsCal + fatsCal || 1;

    const data = [
        { name: 'Protein', value: Math.round((proteinCal / totalMacrosCal) * 100), color: '#38BDF8' }, // Blue
        { name: 'Carbs', value: Math.round((carbsCal / totalMacrosCal) * 100), color: '#F59E0B' },   // Orange/Amber
        { name: 'Fats', value: Math.round((fatsCal / totalMacrosCal) * 100), color: '#10B981' },    // Green
    ];

    // Data for nested rings (Inner to Outer)
    const ringData = [
        { value: data[0].value, color: data[0].color, bg: '#F0F9FF', name: 'Protein' },
        { value: data[1].value, color: data[1].color, bg: '#FFFBEB', name: 'Carbs' },
        { value: data[2].value, color: data[2].color, bg: '#F0FDF4', name: 'Fats' },
    ];

    return (
        <div className="relative h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    {/* Ring 3: Fats (Outer) */}
                    <Pie
                        data={[{ value: ringData[2].value }, { value: 100 - ringData[2].value }]}
                        innerRadius={85}
                        outerRadius={95}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={ringData[2].color} />
                        <Cell fill={ringData[2].bg} />
                    </Pie>

                    {/* Ring 2: Carbs (Middle) */}
                    <Pie
                        data={[{ value: ringData[1].value }, { value: 100 - ringData[1].value }]}
                        innerRadius={70}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={ringData[1].color} />
                        <Cell fill={ringData[1].bg} />
                    </Pie>

                    {/* Ring 1: Protein (Inner) */}
                    <Pie
                        data={[{ value: ringData[0].value }, { value: 100 - ringData[0].value }]}
                        innerRadius={55}
                        outerRadius={65}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={ringData[0].color} />
                        <Cell fill={ringData[0].bg} />
                        <Label
                            content={({ viewBox }) => {
                                const { cx, cy } = viewBox as any;
                                return (
                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                                        <tspan x={cx} dy="-0.5em" className="text-xl font-black fill-primary-900">
                                            Macro
                                        </tspan>
                                        <tspan x={cx} dy="1.2em" className="text-xl font-black fill-primary-900">
                                            Breakdown
                                        </tspan>
                                    </text>
                                );
                            }}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Legend Labels - Cleaned up and positioned better */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Protein Label */}
                <div className="absolute top-2 left-6 flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">Protein</span>
                    <span className="text-sm font-bold text-primary-900">{data[0].value}%</span>
                </div>
                {/* Carbs Label */}
                <div className="absolute top-2 right-6 flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Carbs</span>
                    <span className="text-sm font-bold text-primary-900">{data[1].value}%</span>
                </div>
                {/* Fats Label */}
                <div className="absolute bottom-6 right-8 flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Fats</span>
                    <span className="text-sm font-bold text-primary-900">{data[2].value}%</span>
                </div>
            </div>
        </div>
    );
}
