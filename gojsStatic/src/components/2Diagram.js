import React, { useEffect, useRef, useState } from 'react';
import * as go from 'gojs';

function Diagram({ pipes, nodeDataArray, onPipeValueChange }) {
  const diagramRef = useRef();
  const diagramInstance = useRef(null);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [temperatureValue, setTemperatureValue] = useState(0);
  const [coilImageUrl, setCoilImageUrl] = useState(getCoilImageForTemperature(0));

  const componentOptions = [
    { label: 'Pump', type: 'node' },
    { label: 'Valve', type: 'node' },
    { label: 'Tank', type: 'node' },
    { label: 'Coil', type: 'node' },
    { label: 'Pipe (Elbow)', type: 'pipe', pipeType: 'elbow' },
    { label: 'Pipe (Straight)', type: 'pipe', pipeType: 'straight' }
  ];

  // Function to select the correct coil image based on temperature
  function getCoilImageForTemperature(temp) {
    if (temp < 30) return 'images/coil image2.png';
    if (temp < 50) return 'images/coil_blue1.png';
    if (temp < 50) return 'images/coil_blue3.png';
    if (temp < 60) return 'images/coil_blue2.png'
    if (temp < 30) return 'images/coil image2.png'
    if (temp < -50) return 'images/coil_blue1.png';
    if (temp < -60) return 'images/coil_blue2.png';
    if (temp < 80) return 'images/coil_red1.png';
    if (temp < 90) return 'images/coil_red2.png';
    return 'images/coil_red3.png';
  }

  // Update coil image when temperature changes
  useEffect(() => {
    setCoilImageUrl(getCoilImageForTemperature(temperatureValue));
  }, [temperatureValue]);

  // Force GoJS to update the coil image when the image changes
  useEffect(() => {
    if (!diagramInstance.current) return;
    diagramInstance.current.nodes.each(node => {
      if (node.data.shape === 'Coil') {
        const picture = node.findObject('COIL_PICTURE');
        if (picture) {
          picture.source = coilImageUrl;
        }
      }
    });
  }, [coilImageUrl]);

  // Initialize GoJS diagram
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
        'linkReshapingTool.isEnabled': true,
        layout: $(go.GridLayout, { wrappingColumn: 2, spacing: new go.Size(50, 50) }),
      });

      diagram.nodeTemplate =
        $(go.Node, 'Spot',
          { selectionAdorned: true },
          // Coil PNG Panel
          $(go.Panel, 'Auto',
            new go.Binding('visible', 'shape', s => s === 'Coil'),
            $(go.Picture,
              { name: 'COIL_PICTURE', width: 300, height: 300 },
              new go.Binding('source', '', () => coilImageUrl)
            )
          ),
          // Other shapes panel
          $(go.Panel, 'Auto',
            new go.Binding('visible', 'shape', s => s !== 'Coil'),
            $(go.Shape, 'RoundedRectangle',
              { strokeWidth: 1 },
              new go.Binding('figure', 'shape'),
              new go.Binding('fill', 'fill')
            )
          ),
          $(go.TextBlock,
            { margin: 8 },
            new go.Binding('text', 'key')
          ),
          makePort('T', go.Spot.Top, true, true),
          makePort('L', go.Spot.Left, true, true),
          makePort('R', go.Spot.Right, true, true),
          makePort('B', go.Spot.Bottom, true, true)
        );

      diagram.linkTemplate =
        $(go.Link,
          { reshapable: true },
          $(go.Shape, { stroke: "transparent", strokeWidth: 10 }),
          $(go.Picture, 'images/pipeimage3.png', { width: 200, height: 200 })
        );

      diagram.addDiagramListener('ChangedSelection', (e) => {
        const part = e.diagram.selection.first();
        setSelectedNode(part?.data || null);
      });

      diagram.model = new go.GraphLinksModel(nodeDataArray || [], pipes || []);
      diagramInstance.current = diagram;
    } else {
      diagramInstance.current.requestUpdate();
    }
  }, [coilImageUrl]);

  useEffect(() => {
    if (diagramInstance.current && pipes && nodeDataArray) {
      diagramInstance.current.model = new go.GraphLinksModel(nodeDataArray, pipes);
      diagramInstance.current.requestUpdate();
    }
  }, [pipes, nodeDataArray]);

  const handleAddComponent = (e) => {
    const idx = e.target.value;
    if (idx === "") return;
    const selected = componentOptions[idx];
    setSelectedComponent(idx);

    if (selected.type === 'node') {
      if (diagramInstance.current) {
        const newNodeData = {
          key: `${selected.label} ${diagramInstance.current.model.nodeDataArray.length + 1}`,
          shape: getShapeForComponent(selected.label),
          fill: getColorFromValue(1),
          value: 1
        };
        diagramInstance.current.model.addNodeData(newNodeData);
      }
    } else if (selected.type === 'pipe') {
      if (
        diagramInstance.current &&
        diagramInstance.current.model.nodeDataArray.length >= 2
      ) {
        const nodes = diagramInstance.current.model.nodeDataArray;
        const from = nodes[nodes.length - 2].key;
        const to = nodes[nodes.length - 1].key;
        const newPipe = {
          from,
          to,
          type: selected.pipeType,
          status: "active",
          value: 1
        };
        diagramInstance.current.model.addLinkData(newPipe);
      }
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
    const node = selectedNode; // Use selected node

    if (node && node.shape === 'Coil') {
      diagram.model.startTransaction('update color');
      diagram.model.setDataProperty(node, 'value', value);
      diagram.model.setDataProperty(node, 'fill', getColorFromValue(value));
      diagram.model.commitTransaction('update color');
    }
  };

  const getShapeForComponent = (component) => {
    switch (component) {
      case 'Pump': return 'Ellipse';
      case 'Valve': return 'Diamond';
      case 'Tank': return 'Rectangle';
      case 'pipe': return 'Pipe';
      case 'Coil': return 'Coil';
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
      {/* Temperature Input Section */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          Coil Temperature:&nbsp;
          <input
            type="number"
            value={temperatureValue}
            onChange={e => setTemperatureValue(Number(e.target.value))}
            placeholder="Enter temperature (-50 to 100)"
            min={-50}
            max={100}
          />
        </label>
      </div>

      <div>
        <label>
          Select Component:{' '}
          <select value={selectedComponent} onChange={handleAddComponent}>
            <option value="">-- Choose --</option>
            {componentOptions.map((comp, idx) => (
              <option key={idx} value={idx}>{comp.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label>
          Pipe Value:{' '}
          <input
            type="number"
            min="1"
            max="100"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value (1–100)"
          />
        </label>
        <button
          onClick={() => {
            const value = parseInt(inputValue, 10);
            if (value >= 1 && value <= 100 && onPipeValueChange) {
              onPipeValueChange(value);
            }
          }}
        >
          Update Pipes
        </button>
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
