import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

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

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all', // ensure the button is clickable
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className="w-5 h-5 bg-card border border-white/20 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all shadow-sm"
                        onClick={onEdgeClick}
                        title="Disconnect"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
