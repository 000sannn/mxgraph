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
      for (let i = 0; i < 500; i += 10) {
        const vertex = graph.insertVertex(
          parent,
          null,
          node,
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          w,
          h
        );
        vertex.setValue(text);
        console.log(vertex);
      }
      //   const vertex = graph.insertVertex(parent, null, node, x, y, w, h);
      //   vertex.setValue(text);
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
      const movedCells = evt.getProperty("cells");
      let { dx, dy } = evt.properties;

      //insert string on collision nodes
      graph.getModel().beginUpdate();
      insertEdgeByCollision(dx, dy, movedCells, graph);
      graph.getModel().endUpdate();
    });
  }
}
