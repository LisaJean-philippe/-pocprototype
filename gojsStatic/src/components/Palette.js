import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';

function Palette({ shapeType }) {
  const paletteRef = useRef();

  useEffect(() => {
    const $ = go.GraphObject.make;

    const palette = $(go.Palette, paletteRef.current);

    palette.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, shapeType, {
          fill: 'lightblue',
          strokeWidth: 2,
          width: 80,
          height: 40
        }),
        $(go.TextBlock,
          { margin: 5 },
          new go.Binding('text', 'key'))
      );

    palette.model = new go.GraphLinksModel([
      { key: shapeType }
    ]);

    return () => palette.clear();
  }, [shapeType]);

  return (
    <div
      ref={paletteRef}
      style={{
        width: '120px',
        height: '150px',
        border: '1px solid gray',
        marginRight: '10px'
      }}
    />
  );
}

export default Palette;
