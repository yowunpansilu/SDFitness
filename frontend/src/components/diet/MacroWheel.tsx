import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface MacroWheelProps {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    targetCalories?: number;
}

export function MacroWheel({ calories, protein, carbs, fats, targetCalories = 2000 }: MacroWheelProps) {
    // Calculate percentages for the nested rings
    const proteinCal = protein * 4;
    const carbsCal = carbs * 4;
    const fatsCal = fats * 9;
    const totalMacrosCal = proteinCal + carbsCal + fatsCal || 1;

    const data = [
        { name: 'Protein', value: Math.round((proteinCal / totalMacrosCal) * 100), color: '#38BDF8' }, // Blue
        { name: 'Carbs', value: Math.round((carbsCal / totalMacrosCal) * 100), color: '#F59E0B' },   // Orange/Amber
        { name: 'Fats', value: Math.round((fatsCal / totalMacrosCal) * 100), color: '#10B981' },    // Green (Screenshot shows yellow/green)
    ];

    // Data for nested rings (Inner to Outer)
    // 0: Protein, 1: Carbs, 2: Fats
    const ringData = [
        { value: data[0].value, color: data[0].color, bg: '#F0F9FF' },
        { value: data[1].value, color: data[1].color, bg: '#FFFBEB' },
        { value: data[2].value, color: data[2].color, bg: '#F0FDF4' },
    ];

    return (
        <div className="relative h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
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
                                        <tspan x={cx} dy="-0.5em" className="text-lg font-bold fill-foreground" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            Macro
                                        </tspan>
                                        <tspan x={cx} dy="1.2em" className="text-lg font-bold fill-foreground" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            Wheel
                                        </tspan>
                                    </text>
                                );
                            }}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Labels around the wheel */}
            <div className="absolute top-4 left-4 text-xs font-semibold text-muted-foreground">
                <div style={{ color: ringData[0].color }}>Protein</div>
                <div className="text-foreground">{data[0].value}%</div>
            </div>
            <div className="absolute top-4 right-4 text-xs font-semibold text-muted-foreground text-right">
                <div style={{ color: ringData[1].color }}>Carbs</div>
                <div className="text-foreground">{data[1].value}%</div>
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-semibold text-muted-foreground text-right filter brightness-90">
                <div style={{ color: ringData[0].color }}>Protein</div>
                <div className="text-foreground">{data[0].value}%</div>
            </div>
        </div>
    );
}

