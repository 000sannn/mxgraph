export function disabler(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
}

export function disableSelect(el) {
    if (el.addEventListener) {
        el.addEventListener("mousedown", disabler, "false");
    } else {
        el.attachEvent("onselectstart", disabler);
    }
}

export function enableSelect(el) {
    if (el.addEventListener) {
        el.removeEventListener("mousedown", disabler, "false");
    } else {
        el.detachEvent("onselectstart", disabler);
    }
}

export function isCollision(geo0, geo1) {
    const { x: x0, y: y0, width: w0, height: h0 } = geo0;
    const { x: x1, y: y1, width: w1, height: h1 } = geo1;
    return x1 + w1 > x0 && x0 + w0 > x1 && y1 + h1 > y0 && y0 + h0 > y1;
}

export function getCellsHadCollision(movedCell, checkCells) {
    return checkCells.filter(cell => {
        const isSameCell = cell.id === movedCell.id;
        return (
            isSameCell === false &&
            isCollision(cell.geometry, movedCell.geometry) === true
        );
    });
}

export function getCellsDontHaveEdge(movedCell, checkCells) {

    return checkCells.filter(cell => {
        const hasEdge =
            movedCell.edges &&
            movedCell.edges.find(
                c => c.target === cell || c.source === cell
            );
        return Boolean(hasEdge) === false;
    });
}

export function insertEdgeByCollision(dx, dy, movedCells, graph) {
    const defaultGraphParent = graph.getDefaultParent();
    const allCellsInGraph = graph.getChildVertices(defaultGraphParent);
    for (const movedCell of movedCells) {
        const cellsHadCollision = getCellsHadCollision(movedCell, allCellsInGraph);
        const cellsDontHaveEdge = getCellsDontHaveEdge(movedCell, cellsHadCollision);
        for (const cell of cellsDontHaveEdge) {
            graph.insertEdge(defaultGraphParent, null, "", movedCell, cell);
        }
        if (cellsHadCollision.length > 0) {
            movedCell.getGeometry().translate(-dx, -dy);
        }
    }
}
