'use client';

import { useCallback, useState, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    ReactFlowProvider,
    useReactFlow,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, RefreshCw, Save, Grid, GripVertical, Plus } from 'lucide-react';
import Link from 'next/link';
import AgentNode from '@/components/workflow/AgentNode';
import DeletableEdge from '@/components/workflow/DeletableEdge';
import { AgentRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NodeInspector } from '@/components/workflow/NodeInspector';
import { EdgeInspector } from '@/components/workflow/EdgeInspector';

// Node Types Registration
const nodeTypes = {
    agent: AgentNode,
};

const edgeTypes = {
    deletable: DeletableEdge,
};

// Available Agents for Dragging
const availableAgents = [
    { role: 'MANAGER', label: 'Project Manager' },
    { role: 'DEVELOPER', label: 'Frontend Dev' },
    { role: 'DEVELOPER', label: 'Backend Dev' },
    { role: 'DESIGNER', label: 'UI/UX Designer' },
    { role: 'RESEARCHER', label: 'Tech Researcher' },
    { role: 'REVIEWER', label: 'Code Reviewer' },
];

const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 250, y: 50 },
        type: 'agent',
        data: { label: 'Project Lead', role: 'MANAGER', status: 'ACTIVE' },
    },
    {
        id: '2',
        position: { x: 100, y: 200 },
        type: 'agent',
        data: { label: 'Frontend Dev', role: 'DEVELOPER', status: 'IDLE' },
    },
    {
        id: '3',
        position: { x: 400, y: 200 },
        type: 'agent',
        data: { label: 'UI Designer', role: 'DESIGNER', status: 'Working' },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'deletable', animated: true, style: { stroke: '#64748b' } },
    { id: 'e1-3', source: '1', target: '3', type: 'deletable', animated: true, style: { stroke: '#64748b' } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function WorkflowEditor() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSaved, setIsSaved] = useState(true);
    const { screenToFlowPosition } = useReactFlow();
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setSelectedEdge(null); // Clear edge selection
    }, []);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
        setSelectedNode(null); // Clear node selection
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);

    const onNodeUpdate = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: { ...node.data, ...newData },
                    };
                }
                return node;
            })
        );
        setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev);
        setIsSaved(false);
    }, [setNodes]);

    const onEdgeUpdate = useCallback((edgeId: string, newData: any) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === edgeId) {
                    return {
                        ...edge,
                        data: { ...edge.data, ...newData },
                    };
                }
                return edge;
            })
        );
        setSelectedEdge((prev) => prev?.id === edgeId ? { ...prev, data: { ...prev.data, ...newData } } : prev);
        setIsSaved(false);
    }, [setEdges]);



    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge({ ...params, type: 'deletable', animated: true, style: { stroke: '#64748b' } }, eds));
            setIsSaved(false);
        },
        [setEdges],
    );

    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/nodeData', JSON.stringify(nodeData));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const dataString = event.dataTransfer.getData('application/nodeData');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const nodeData = JSON.parse(dataString);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { label: nodeData.label, role: nodeData.role, status: 'IDLE' },
            };

            setNodes((nds) => nds.concat(newNode));
            setIsSaved(false);
        },
        [screenToFlowPosition, setNodes],
    );

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/projects/1" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Workflow Editor</h1>
                        <p className="text-muted-foreground text-sm">Drag agents to build your team structure.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setNodes(initialNodes); setEdges(initialEdges); setIsSaved(true); }}
                        className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                        title="Reset Layout"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors",
                            isSaved ? "bg-secondary text-muted-foreground cursor-default" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                    >
                        <Save className="h-4 w-4" />
                        {isSaved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Sidebar / Drag Source */}
                <aside className="w-64 flex flex-col gap-4 shrnk-0">
                    <div className="glass-card rounded-xl p-4 flex-1 flex flex-col overflow-y-auto">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <Grid className="h-4 w-4" /> Available Agents
                        </h3>
                        <div className="space-y-3">
                            {availableAgents.map((agent, index) => (
                                <div
                                    key={index}
                                    className="bg-secondary/30 border border-white/5 rounded-lg p-3 cursor-grab hover:bg-secondary/50 hover:border-primary/30 transition-all flex items-center gap-3 group"
                                    onDragStart={(event) => onDragStart(event, 'agent', agent)}
                                    draggable
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                                    <div>
                                        <div className="text-sm font-semibold">{agent.label}</div>
                                        <div className="text-[10px] text-muted-foreground bg-black/20 px-1.5 py-0.5 rounded inline-block">
                                            {agent.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/5">
                            <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors border border-dashed border-white/10 rounded-lg hover:bg-white/5">
                                <Plus className="h-3 w-3" /> Create New Agent Type
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <h4 className="text-xs font-bold mb-2 text-muted-foreground uppercase tracking-wider">Instructions</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Drag agents from this list to the canvas.</li>
                            <li>Connect dots to define communication flow.</li>
                            <li>Select a node and press Backspace to delete.</li>
                        </ul>
                    </div>
                </aside>

                {/* Canvas */}
                <div className="flex-1 border border-white/10 rounded-xl overflow-hidden glass-card relative h-full flex" ref={reactFlowWrapper}>
                    <div className="flex-1 h-full">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onNodeClick={onNodeClick}
                            onEdgeClick={onEdgeClick}
                            onPaneClick={onPaneClick}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            className="bg-black/20"
                        >
                            <Controls className="bg-secondary/50 border-white/10 text-foreground fill-foreground" />
                            <Background color="#444" gap={20} size={1} />
                            <Panel position="top-right" className="bg-card/80 backdrop-blur border border-white/10 p-2 rounded-lg text-xs font-mono text-muted-foreground mr-12">
                                Nodes: {nodes.length} | Edges: {edges.length}
                            </Panel>
                        </ReactFlow>
                    </div>

                    {/* Inspector Panel Overlay */}
                    {selectedNode && (
                        <NodeInspector
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                            onUpdate={onNodeUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function WorkflowPageWrapper() {
    return (
        <ReactFlowProvider>
            <WorkflowEditor />
        </ReactFlowProvider>
    );
}
