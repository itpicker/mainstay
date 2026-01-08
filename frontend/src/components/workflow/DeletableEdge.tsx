import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    // Determine visual style based on connection type
    const connectionType = (data?.connectionType as string) || 'BLOCKING';

    let edgeStyle = { ...style, strokeWidth: 2 };

    if (connectionType === 'ASYNC') {
        edgeStyle = { ...edgeStyle, strokeDasharray: '5,5', stroke: '#3b82f6' }; // Blue dashed
    } else if (connectionType === 'REVIEW') {
        edgeStyle = { ...edgeStyle, stroke: '#a855f7' }; // Purple solid
    } else {
        // BLOCKING (Default)
        edgeStyle = { ...edgeStyle, stroke: '#64748b' }; // Slate solid
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan flex flex-col items-center gap-1"
                >
                    <button
                        className="w-5 h-5 bg-card border border-white/20 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all shadow-sm z-10"
                        onClick={onEdgeClick}
                        title="Disconnect"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {connectionType !== 'BLOCKING' && (
                        <span className={cn(
                            "text-[8px] font-bold px-1 rounded border backdrop-blur-md",
                            connectionType === 'ASYNC' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        )}>
                            {connectionType}
                        </span>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
