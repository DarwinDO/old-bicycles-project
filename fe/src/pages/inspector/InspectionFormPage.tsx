import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react';

interface ScoreItem {
    id: string;
    label: string;
    score: number;
}

export default function InspectionFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [scores, setScores] = useState<ScoreItem[]>([
        { id: 'frame', label: 'Khung (Frame)', score: 5 },
        { id: 'fork', label: 'Phuộc (Fork)', score: 5 },
        { id: 'brakes', label: 'Phanh (Brakes)', score: 5 },
        { id: 'drivetrain', label: 'Truyền động (Drivetrain)', score: 5 },
        { id: 'wheels', label: 'Bánh xe (Wheels)', score: 5 },
    ]);
    const [chainWear, setChainWear] = useState('10');
    const [notes, setNotes] = useState('');

    const handleScoreChange = (id: string, value: number) => {
        setScores((prev) => prev.map((s) => (s.id === id ? { ...s, score: value } : s)));
    };

    const overallScore = (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1);

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Kiểm định xe #{id}</h2>
                    <p className="text-muted-foreground">Giant TCR Advanced Pro · Nguyễn Văn A</p>
                </div>
            </div>

            {/* Scoring */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Đánh giá từng hạng mục (1-5)</h3>
                {scores.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <label className="text-sm text-foreground">{item.label}</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => handleScoreChange(item.id, value)}
                                    className={`w-10 h-10 rounded-lg border transition-colors ${item.score === value
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted border-border hover:bg-muted/80'
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <label className="text-sm text-foreground">% mòn xích líp</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={chainWear}
                            onChange={(e) => setChainWear(e.target.value)}
                            className="w-20 text-center"
                            min="0"
                            max="100"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-semibold text-foreground">Điểm tổng thể</span>
                    <span className="text-2xl font-bold text-primary">{overallScore}/5</span>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Ghi chú chuyên gia</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú về tình trạng xe..."
                    className="w-full h-32 p-3 bg-muted border border-border rounded-lg resize-none text-sm"
                />
            </div>

            {/* Photos */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Ảnh minh chứng</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Kéo thả hoặc click để upload ảnh</p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
                <Button className="flex-1" onClick={() => console.log('Pass')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đạt chuẩn (Passed)
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => console.log('Fail')}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Không đạt (Failed)
                </Button>
            </div>
        </div>
    );
}
