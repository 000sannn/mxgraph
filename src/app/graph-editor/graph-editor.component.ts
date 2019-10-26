import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import MX from "mxgraph";
import { disableSelect, isCollision } from "../../utils";
const {
  mxGraph,
  mxEvent,
  mxCircleLayout,
  mxParallelEdgeLayout,
  mxUtils,
  mxGuide,
  mxPolyline,
  mxConstants
} = new MX();

@Component({
  selector: "app-graph-editor",
  templateUrl: "./graph-editor.component.html",
  styleUrls: ["./graph-editor.component.css"]
})
export class GraphEditorComponent implements AfterViewInit {
  @ViewChild("graphArea", { static: true }) graphArea: ElementRef;

  graph = null;

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
      for (let i = 0; i < 100; i += 10) {
        const vertex = graph.insertVertex(
          parent,
          null,
          node,
          x + i,
          y + i,
          w,
          h
        );
        vertex.setValue(text);
      }
    } finally {
      graph.getModel().endUpdate();
    }
  }

  ngAfterViewInit() {
    const graphRoot = this.graphArea.nativeElement;
    const graph = new mxGraph(graphRoot);
    const defaultNodeWidth = 130;
    const defaultNodeHeight = 40;
    const defaultText = "default text";
    const defaultGraphParent = graph.getDefaultParent();
    this.graph = graph;

    new mxCircleLayout(graph).execute(defaultGraphParent);
    new mxParallelEdgeLayout(graph).execute(defaultGraphParent);

    disableSelect(graphRoot);

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
      console.log("moved");
      const movedCells = evt.getProperty("cells");
      const ListCells = sender.getChildVertices(defaultGraphParent);
      let { dx, dy } = evt.properties;
      for (const movedCell of movedCells) {
        for (const cell of ListCells) {
          if (cell.mxObjectId === movedCell.mxObjectId) {
            continue;
          }

          const hasEdge =
            movedCell.edges &&
            movedCell.edges.find(c => c.target === cell || c.source === cell);
          if (isCollision(cell.geometry, movedCell.geometry) === true) {
            graph.getModel().beginUpdate();
            if (Boolean(hasEdge) === false) {
              graph.insertEdge(defaultGraphParent, null, "", movedCell, cell);
            }
            movedCell.getGeometry().translate(-dx, -dy);
            graph.getModel().endUpdate();
            graph.refresh();
          }
        }
      }
    });
  }
}
