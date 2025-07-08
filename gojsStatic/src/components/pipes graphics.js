console.log('pipes graphics.js loaded');
import * as go from 'gojs';

go.Shape.defineFigureGenerator('PipeElbow', (shape, w, h) => {
    return new go.Geometry()
        .add(new go.PathFigure(0, h * 0.2, false)
            .add(new go.PathSegment(go.PathSegment.Line, w * 0.8, h * 0.2))
            .add(new go.PathSegment(go.PathSegment.Line, w * 0.8, h)));
});
