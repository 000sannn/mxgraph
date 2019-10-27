import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import MX from "mxgraph";
import { disableSelect, insertEdgeByCollision } from "../../utils";
const {
    mxGraph,
    mxEvent,
    mxCircleLayout,
    mxParallelEdgeLayout,
    mxUtils,
    mxGuide,
    mxPolyline,
    mxConstants,
    mxDefaultKeyHandler,
    mxMorphing,
    mxRubberband,
    mxWindow,
    mxOutline,
    mxEffects,
    mxGeometryChange
} = new MX();

@Component({
    selector: "app-graph-editor",
    templateUrl: "./graph-editor.component.html",
    styleUrls: ["./graph-editor.component.css"]
})
export class GraphEditorComponent implements AfterViewInit {
    @ViewChild("graphArea", { static: false }) graphArea: ElementRef;
    @ViewChild("outline", { static: true }) outline: ElementRef;

    private graph = null;
    public gridImage = "../../assets/grid.svg";

    addNode(text: string, x: number, y: number, w: number, h: number) {
        if (this.graph === null) {
            return false;
        }
        const graph = this.graph;

        const doc = mxUtils.createXmlDocument();
        const node = doc.createElement("node");
        try {
            const parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            for (let i = 0; i < 300; i += 10) {
                const vertex = graph.insertVertex(
                    parent,
                    null,
                    node,
                    x,
                    y + i,
                    w,
                    h
                );
                vertex.setValue(text);
            }
            //   const vertex = graph.insertVertex(parent, null, node, x, y, w, h);
            //   vertex.setValue(text);
        } finally {
            graph.getModel().endUpdate();
        }
    }

    ngAfterViewInit() {
        const graphRoot = this.graphArea.nativeElement;
        mxEvent.disableContextMenu(graphRoot);
        const outlineWindow = new mxWindow(
            null,
            this.outline.nativeElement,
            0,
            0,
            500
        );
        const graph = new mxGraph(graphRoot);
        const defaultNodeWidth = 130;
        const defaultNodeHeight = 40;
        const defaultText = "default text";
        const defaultGraphParent = graph.getDefaultParent();

        graph.setTooltips(true);
        graph.setPanning(true);
        new mxRubberband(graph);
        new mxOutline(graph, this.outline.nativeElement);
        new mxCircleLayout(graph).execute(defaultGraphParent);
        new mxParallelEdgeLayout(graph).execute(defaultGraphParent);

        graph.keyHandler = new mxDefaultKeyHandler(graph);
        graph.morph = new mxMorphing(graph, 20, 1.2, 20);

        outlineWindow.setResizable(false);
        outlineWindow.setMinimizable(false);
        outlineWindow.setMaximizable(false);
        outlineWindow.setClosable(false);
        outlineWindow.show();

        graph
            .getModel()
            .addListener(mxEvent.CELLS_MOVED, function(sender, evt) {
                const changes = evt.getProperty("edit").changes;
                console.log(changes);
                mxEffects.animateChanges(graph, changes);
            });

        window.addEventListener("resize", evt => {
            evt.preventDefault();
            var iw =
                window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;
            var ih =
                window.innerHeight ||
                document.documentElement.clientHeight ||
                document.body.clientHeight;

            var x = outlineWindow.getX();
            var y = outlineWindow.getY();

            if (x + outlineWindow.table.clientWidth > iw) {
                x = Math.max(0, iw - outlineWindow.table.clientWidth);
            }

            if (y + outlineWindow.table.clientHeight > ih) {
                y = Math.max(0, ih - outlineWindow.table.clientHeight);
            }

            if (outlineWindow.getX() != x || outlineWindow.getY() != y) {
                outlineWindow.setLocation(x, y);
            }
        });

        // Changes some default colors
        mxConstants.HANDLE_FILLCOLOR = "#99ccff";
        mxConstants.HANDLE_STROKECOLOR = "#0088cf";
        mxConstants.VERTEX_SELECTION_COLOR = "#00a8ff";

        this.graph = graph;

        disableSelect(graphRoot);
        console.log(graph.keyHandler);
        graph.graphHandler.guidesEnabled = true;
        mxGuide.prototype.getGuideColor = () => "#bbbb99";

        mxGuide.prototype.createGuideShape = function(horizontal) {
            var guide = new mxPolyline(
                [],
                mxConstants.GUIDE_COLOR,
                mxConstants.GUIDE_STROKEWIDTH
            );
            guide.isDashed = false;
            return guide;
        };

        // console.log(wnd);
        graphRoot.addEventListener("dblclick", evt => {
            const midX: number = evt.clientX - defaultNodeWidth / 2;
            const midY: number = evt.clientY - defaultNodeHeight / 2;
            this.addNode(
                defaultText,
                midX,
                midY,
                defaultNodeWidth,
                defaultNodeHeight
            );
        });

        graph.addListener(mxEvent.CELLS_MOVED, (sender, evt) => {
            const movedCells = evt.getProperty("cells");
            let { dx, dy } = evt.properties;
            //insert string on collision nodes
            insertEdgeByCollision(dx, dy, movedCells, graph);
        });

        const scale = graph.view.scale;
        const bounds = graph.getGraphBounds();
        graph.view.setTranslate(-bounds.x / scale, -bounds.y / scale);
    }
}
