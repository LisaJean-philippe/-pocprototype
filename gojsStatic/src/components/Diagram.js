import React, { useEffect, useRef, useState } from 'react';
import * as go from 'gojs';

function Diagram() {
  const diagramRef = useRef();
  const diagramInstance = useRef(null);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  const componentOptions = ['Pump', 'Valve', 'Tank'];

  useEffect(() => {
    const $ = go.GraphObject.make;

    if (!diagramInstance.current) {
      const diagram = $(go.Diagram, diagramRef.current, {
        'undoManager.isEnabled': true,
        'resizingTool.isEnabled': true,
        'relinkingTool.isEnabled': true,
        'linkingTool.isEnabled': true,
        'linkingTool.direction': go.LinkingTool.ForwardsOnly,
        'linkingTool.archetypeLinkData': { from: '', to: '' },
        layout: $(go.TreeLayout, { angle: 0, layerSpacing: 35 }),
      });

      diagram.nodeTemplate =
        $(go.Node, 'Spot',
          { selectionAdorned: true },
          $(go.Panel, 'Auto',
            $(go.Shape, 'RoundedRectangle',
              { strokeWidth: 1 },
              new go.Binding('figure', 'shape'),
              new go.Binding('fill', 'fill')
            ),
            $(go.TextBlock,
              { margin: 8 },
              new go.Binding('text', 'key'))
          ),
          makePort('T', go.Spot.Top, true, true),
          makePort('L', go.Spot.Left, true, true),
          makePort('R', go.Spot.Right, true, true),
          makePort('B', go.Spot.Bottom, true, true)
        );

      diagram.linkTemplate =
        $(go.Link,
          { routing: go.Link.AvoidsNodes, corner: 5, relinkableFrom: true, relinkableTo: true },
          $(go.Shape),
          );
          diagram.addDiagramListener('ChangedSelection', (e) => {
              const part = e.diagram.selection.first();
              setSelectedNode(part?.data || null);
          });
      diagram.model = new go.GraphLinksModel([], []);
      diagramInstance.current = diagram;
    }
  }, []);

  const handleAddComponent = (e) => {
    const component = e.target.value;
    setSelectedComponent(component);

    if (diagramInstance.current && component) {
      const newNodeData = {
        key: `${component} ${diagramInstance.current.model.nodeDataArray.length + 1}`,
        shape: getShapeForComponent(component),
        fill: getColorFromValue(1), // default light color
        value: 1
      };
      diagramInstance.current.model.addNodeData(newNodeData);
    }
  };
  const handleDeleteNode = () => {
  if (!selectedNode) return;

  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${selectedNode.key}"?`
  );

  if (confirmDelete && diagramInstance.current) {
    diagramInstance.current.model.startTransaction('delete node');
    diagramInstance.current.model.removeNodeData(selectedNode);
    diagramInstance.current.model.commitTransaction('delete node');
    setSelectedNode(null);
  }
};


  const handleUpdateNodeColor = () => {
    const value = parseInt(inputValue, 10);
    if (!value || value < 1 || value > 100) return;

    const diagram = diagramInstance.current;
    const lastNode = diagram.model.nodeDataArray.at(-1); // update last added node

    if (lastNode) {
      diagram.model.startTransaction('update color');
      diagram.model.setDataProperty(lastNode, 'value', value);
      diagram.model.setDataProperty(lastNode, 'fill', getColorFromValue(value));
      diagram.model.commitTransaction('update color');
    }
  };

  const getShapeForComponent = (component) => {
    switch (component) {
      case 'Pump': return 'Ellipse';
      case 'Valve': return 'Diamond';
      case 'Tank': return 'Rectangle';
      default: return 'RoundedRectangle';
    }
  };

  const getColorFromValue = (value) => {
    const intensity = Math.min(255, Math.floor(255 - (value / 100) * 200));
    return `rgb(${intensity}, ${intensity + 20}, 255)`;
  };

  const makePort = (name, spot, output, input) => {
    const $ = go.GraphObject.make;
    return $(go.Shape, 'Circle',
      {
        fill: 'transparent',
        stroke: null,
        desiredSize: new go.Size(8, 8),
        alignment: spot,
        alignmentFocus: spot,
        portId: name,
        fromSpot: spot,
        toSpot: spot,
        fromLinkable: output,
        toLinkable: input,
        cursor: 'pointer',
        mouseEnter: (e, port) => port.fill = 'rgba(0,0,0,0.3)',
        mouseLeave: (e, port) => port.fill = 'transparent'
      });
  };

  return (
    <div>
      <div>
        <label>
          Select Component:{' '}
          <select value={selectedComponent} onChange={handleAddComponent}>
            <option value="">-- Choose --</option>
            {componentOptions.map((comp) => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          type="number"
          min="1"
          max="100"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter value (1–100)"
        />
        <button onClick={handleUpdateNodeColor}>Update Color</button>
      </div>

      <div
        ref={diagramRef}
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid black',
          marginTop: '20px'
        }}
      />
      
<button
  onClick={handleDeleteNode}
  disabled={!selectedNode}
  style={{ marginTop: '10px' }}
>
  Delete Selected Component
</button>
 </div>
  );
}

export default Diagram;
