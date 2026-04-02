import { describe, it, expect, beforeEach } from 'vitest';
import { CodeForgeSystem } from '../../src/systems/code-forge.js';
import type { BlockProgram, GridWorld, GridCell } from '../../src/types/code-forge.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeGrid(width: number, height: number, walls: Array<[number, number]> = [], items: Array<[number, number, string]> = [], goals: Array<[number, number]> = []): GridWorld {
  const cells: GridCell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y]![x] = { type: 'empty' };
    }
  }
  for (const [wx, wy] of walls) {
    if (cells[wy]?.[wx]) cells[wy]![wx] = { type: 'wall' };
  }
  for (const [ix, iy, item] of items) {
    if (cells[iy]?.[ix]) cells[iy]![ix] = { type: 'item', item };
  }
  for (const [gx, gy] of goals) {
    if (cells[gy]?.[gx]) cells[gy]![gx] = { type: 'goal' };
  }
  return { width, height, cells, robotStart: { x: 0, y: 0, direction: 0 }, goals: goals.map(([x, y]) => ({ x, y })) };
}

// ─── Block Library ──────────────────────────────────────────────────────────

describe('CodeForgeSystem — Block Library', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('returns Foundation blocks for foundation tier', () => {
    const blocks = forge.getAvailableBlocks('foundation');
    expect(blocks.length).toBeGreaterThanOrEqual(3);
    expect(blocks.find(b => b.id === 'move_forward')).toBeDefined();
    expect(blocks.find(b => b.id === 'turn')).toBeDefined();
    expect(blocks.find(b => b.id === 'repeat')).toBeDefined();
  });

  it('foundation does NOT include discovery+ blocks', () => {
    const blocks = forge.getAvailableBlocks('foundation');
    expect(blocks.find(b => b.id === 'if')).toBeUndefined();
    expect(blocks.find(b => b.id === 'while')).toBeUndefined();
    expect(blocks.find(b => b.id === 'define_function')).toBeUndefined();
  });

  it('discovery includes foundation + discovery blocks', () => {
    const blocks = forge.getAvailableBlocks('discovery');
    expect(blocks.find(b => b.id === 'move_forward')).toBeDefined(); // foundation
    expect(blocks.find(b => b.id === 'if')).toBeDefined();            // discovery
    expect(blocks.find(b => b.id === 'if_else')).toBeDefined();       // discovery
    expect(blocks.find(b => b.id === 'while')).toBeDefined();         // discovery
    expect(blocks.find(b => b.id === 'set_variable')).toBeDefined();  // discovery
  });

  it('builder includes foundation + discovery + builder blocks', () => {
    const blocks = forge.getAvailableBlocks('builder');
    expect(blocks.find(b => b.id === 'move_forward')).toBeDefined();
    expect(blocks.find(b => b.id === 'if')).toBeDefined();
    expect(blocks.find(b => b.id === 'define_function')).toBeDefined();
    expect(blocks.find(b => b.id === 'create_list')).toBeDefined();
    expect(blocks.find(b => b.id === 'for_each')).toBeDefined();
    expect(blocks.find(b => b.id === 'string_join')).toBeDefined();
  });

  it('innovator includes text code blocks', () => {
    const blocks = forge.getAvailableBlocks('innovator');
    expect(blocks.find(b => b.id === 'text_code')).toBeDefined();
    expect(blocks.find(b => b.id === 'create_dict')).toBeDefined();
  });

  it('creator includes all blocks', () => {
    const blocks = forge.getAvailableBlocks('creator');
    expect(blocks.find(b => b.id === 'sort_list')).toBeDefined();
    expect(blocks.find(b => b.id === 'filter_list')).toBeDefined();
    expect(blocks.find(b => b.id === 'map_list')).toBeDefined();
    expect(blocks.find(b => b.id === 'try_catch')).toBeDefined();
  });

  it('each higher tier has strictly more blocks', () => {
    const tiers = ['foundation', 'discovery', 'builder', 'innovator', 'creator'] as const;
    let prevCount = 0;
    for (const tier of tiers) {
      const count = forge.getAvailableBlocks(tier).length;
      expect(count).toBeGreaterThan(prevCount);
      prevCount = count;
    }
  });

  it('looks up a block by id', () => {
    const block = forge.getBlock('move_forward');
    expect(block).toBeDefined();
    expect(block!.category).toBe('motion');
  });
});

// ─── Block Execution: Foundation ────────────────────────────────────────────

describe('CodeForgeSystem — Block Execution (Foundation)', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('move_forward moves robot', () => {
    const program: BlockProgram = {
      blocks: [{ blockId: 'move_forward', id: 'b1', inputs: { steps: 3 } }],
    };
    const grid = makeGrid(10, 10);
    const result = forge.executeBlocks(program, grid);
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(3);
    expect(result.robotState.y).toBe(0);
  });

  it('turn changes direction', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'turn', id: 'b1', inputs: { direction: 'right' } },
        { blockId: 'move_forward', id: 'b2', inputs: { steps: 2 } },
      ],
    };
    const grid = makeGrid(10, 10);
    const result = forge.executeBlocks(program, grid);
    expect(result.success).toBe(true);
    expect(result.robotState.direction).toBe(90);
    expect(result.robotState.y).toBe(2); // moved down
  });

  it('repeat executes body N times', () => {
    const program: BlockProgram = {
      blocks: [{
        blockId: 'repeat',
        id: 'b1',
        inputs: { times: 4 },
        body: [{ blockId: 'move_forward', id: 'b2', inputs: { steps: 1 } }],
      }],
    };
    const grid = makeGrid(10, 10);
    const result = forge.executeBlocks(program, grid);
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(4);
  });

  it('robot stops at walls', () => {
    const grid = makeGrid(10, 10, [[3, 0]]);
    const program: BlockProgram = {
      blocks: [{ blockId: 'move_forward', id: 'b1', inputs: { steps: 5 } }],
    };
    const result = forge.executeBlocks(program, grid);
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(2); // stops before wall
  });

  it('robot stops at grid boundary', () => {
    const grid = makeGrid(5, 5);
    const program: BlockProgram = {
      blocks: [{ blockId: 'move_forward', id: 'b1', inputs: { steps: 20 } }],
    };
    const result = forge.executeBlocks(program, grid);
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(4); // 0-indexed boundary
  });
});

// ─── Block Execution: Discovery ─────────────────────────────────────────────

describe('CodeForgeSystem — Block Execution (Discovery)', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('if block executes body when condition is true', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'set_variable', id: 'b0', inputs: { name: 'x', value: '5' } },
        {
          blockId: 'if',
          id: 'b1',
          inputs: { condition: 'x > 3' },
          body: [{ blockId: 'move_forward', id: 'b2', inputs: { steps: 2 } }],
        },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.x).toBe(2);
  });

  it('if block skips body when condition is false', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'set_variable', id: 'b0', inputs: { name: 'x', value: '1' } },
        {
          blockId: 'if',
          id: 'b1',
          inputs: { condition: 'x > 3' },
          body: [{ blockId: 'move_forward', id: 'b2', inputs: { steps: 2 } }],
        },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.x).toBe(0);
  });

  it('if_else executes else body when condition is false', () => {
    const program: BlockProgram = {
      blocks: [{
        blockId: 'if_else',
        id: 'b1',
        inputs: { condition: 'false' },
        body: [{ blockId: 'move_forward', id: 'b2', inputs: { steps: 1 } }],
        elseBody: [{ blockId: 'move_forward', id: 'b3', inputs: { steps: 3 } }],
      }],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.x).toBe(3);
  });

  it('while loop repeats until condition is false', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'set_variable', id: 'b0', inputs: { name: 'i', value: '0' } },
        {
          blockId: 'while',
          id: 'b1',
          inputs: { condition: 'i < 3' },
          body: [
            { blockId: 'move_forward', id: 'b2', inputs: { steps: 1 } },
            { blockId: 'set_variable', id: 'b3', inputs: { name: 'i', value: 'i + 1' } },
          ],
        },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.x).toBe(3);
    expect(result.variables['i']).toBe(3);
  });

  it('set_variable and read variable', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'set_variable', id: 'b1', inputs: { name: 'count', value: '42' } },
        { blockId: 'print', id: 'b2', inputs: { message: 'count' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['count']).toBe(42);
    expect(result.output).toContain('42');
  });

  it('pick_up collects items', () => {
    const grid = makeGrid(10, 10, [], [[1, 0, 'gem']]);
    const program: BlockProgram = {
      blocks: [
        { blockId: 'move_forward', id: 'b1', inputs: { steps: 1 } },
        { blockId: 'pick_up', id: 'b2', inputs: {} },
      ],
    };
    const result = forge.executeBlocks(program, grid);
    expect(result.robotState.inventory).toContain('gem');
  });

  it('pen_down draws trail', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'pen_down', id: 'b1', inputs: {} },
        { blockId: 'move_forward', id: 'b2', inputs: { steps: 2 } },
        { blockId: 'pen_up', id: 'b3', inputs: {} },
        { blockId: 'move_forward', id: 'b4', inputs: { steps: 1 } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.trail).toHaveLength(2);
    expect(result.robotState.penDown).toBe(false);
  });

  it('set_pen_color changes trail color', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'set_pen_color', id: 'b1', inputs: { color: '#ff0000' } },
        { blockId: 'pen_down', id: 'b2', inputs: {} },
        { blockId: 'move_forward', id: 'b3', inputs: { steps: 1 } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.trail[0]!.color).toBe('#ff0000');
  });

  it('sense reads sensor data', () => {
    const grid = makeGrid(10, 10, [[1, 0]]);
    const program: BlockProgram = {
      blocks: [{ blockId: 'sense', id: 'b1', inputs: {} }],
    };
    const result = forge.executeBlocks(program, grid);
    expect(result.robotState.sensorData.wallAhead).toBe(true);
  });

  it('print outputs messages', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'print', id: 'b1', inputs: { message: "'Hello, World!'" } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.output).toContain('Hello, World!');
  });
});

// ─── Block Execution: Builder ───────────────────────────────────────────────

describe('CodeForgeSystem — Block Execution (Builder)', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('define and call a function', () => {
    const program: BlockProgram = {
      blocks: [
        {
          blockId: 'define_function',
          id: 'b1',
          inputs: { name: 'goForward', params: '' },
          body: [{ blockId: 'move_forward', id: 'b2', inputs: { steps: 2 } }],
        },
        { blockId: 'call_function', id: 'b3', inputs: { name: 'goForward', args: '' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.robotState.x).toBe(2);
  });

  it('create and use a list', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'create_list', id: 'b1', inputs: { name: 'items' } },
        { blockId: 'add_to_list', id: 'b2', inputs: { list: 'items', item: "'apple'" } },
        { blockId: 'add_to_list', id: 'b3', inputs: { list: 'items', item: "'banana'" } },
        { blockId: 'list_length', id: 'b4', inputs: { list: 'items' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['items']).toEqual(['apple', 'banana']);
    expect(result.variables['__return__']).toBe(2);
  });

  it('for_each iterates over list', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'create_list', id: 'b1', inputs: { name: 'nums' } },
        { blockId: 'add_to_list', id: 'b2', inputs: { list: 'nums', item: '1' } },
        { blockId: 'add_to_list', id: 'b3', inputs: { list: 'nums', item: '2' } },
        { blockId: 'add_to_list', id: 'b4', inputs: { list: 'nums', item: '3' } },
        {
          blockId: 'for_each',
          id: 'b5',
          inputs: { item: 'n', list: 'nums' },
          body: [{ blockId: 'print', id: 'b6', inputs: { message: 'n' } }],
        },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.output).toEqual(['1', '2', '3']);
  });

  it('string_join concatenates strings', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'string_join', id: 'b1', inputs: { a: "'Hello, '", b: "'World!'" } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['__return__']).toBe('Hello, World!');
  });

  it('math operations work', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'math_op', id: 'b1', inputs: { left: '10', op: '*', right: '5' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['__return__']).toBe(50);
  });

  it('compare works', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'compare', id: 'b1', inputs: { left: '5', op: '>', right: '3' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['__return__']).toBe(true);
  });
});

// ─── Block Execution: Innovator+ ────────────────────────────────────────────

describe('CodeForgeSystem — Block Execution (Innovator)', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('create and use a dictionary', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'create_dict', id: 'b1', inputs: { name: 'player' } },
        { blockId: 'set_in_dict', id: 'b2', inputs: { dict: 'player', key: 'name', value: "'Alice'" } },
        { blockId: 'get_from_dict', id: 'b3', inputs: { dict: 'player', key: 'name' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['__return__']).toBe('Alice');
  });
});

// ─── Block Execution: Creator ───────────────────────────────────────────────

describe('CodeForgeSystem — Block Execution (Creator)', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('sort_list sorts numbers ascending', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'create_list', id: 'b1', inputs: { name: 'nums' } },
        { blockId: 'add_to_list', id: 'b2', inputs: { list: 'nums', item: '3' } },
        { blockId: 'add_to_list', id: 'b3', inputs: { list: 'nums', item: '1' } },
        { blockId: 'add_to_list', id: 'b4', inputs: { list: 'nums', item: '2' } },
        { blockId: 'sort_list', id: 'b5', inputs: { list: 'nums', order: 'ascending' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['nums']).toEqual([1, 2, 3]);
  });

  it('filter_list filters based on condition', () => {
    const program: BlockProgram = {
      blocks: [
        { blockId: 'create_list', id: 'b1', inputs: { name: 'nums' } },
        { blockId: 'add_to_list', id: 'b2', inputs: { list: 'nums', item: '1' } },
        { blockId: 'add_to_list', id: 'b3', inputs: { list: 'nums', item: '5' } },
        { blockId: 'add_to_list', id: 'b4', inputs: { list: 'nums', item: '2' } },
        { blockId: 'add_to_list', id: 'b5', inputs: { list: 'nums', item: '8' } },
        { blockId: 'filter_list', id: 'b6', inputs: { list: 'nums', item: 'n', condition: 'n > 3' } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.variables['nums']).toEqual([5, 8]);
  });

  it('try_catch handles errors', () => {
    // Force an error in body, catch it in else
    const program: BlockProgram = {
      blocks: [{
        blockId: 'try_catch',
        id: 'b1',
        inputs: { error: 'err' },
        body: [
          // Reference unknown block to cause error
          { blockId: 'nonexistent_block', id: 'b2', inputs: {} },
        ],
        elseBody: [
          { blockId: 'print', id: 'b3', inputs: { message: "'caught error'" } },
        ],
      }],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.output).toContain('caught error');
  });
});

// ─── Text Code Execution: JavaScript ────────────────────────────────────────

describe('CodeForgeSystem — JavaScript Execution', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('executes simple move commands', () => {
    const code = 'forward(3);';
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(3);
  });

  it('executes turn and move', () => {
    const code = `
      turn_right();
      forward(2);
    `;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.y).toBe(2);
  });

  it('executes loops', () => {
    const code = `
      for (let i = 0; i < 4; i++) {
        forward(1);
        turn('right');
      }
    `;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(0); // ends at start after square
    expect(result.robotState.y).toBe(0);
  });

  it('print outputs to result', () => {
    const code = `print('Hello from JavaScript!');`;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.output).toContain('Hello from JavaScript!');
  });

  it('sense returns sensor data', () => {
    const grid = makeGrid(10, 10, [[1, 0]]);
    const code = `
      const data = sense();
      print(data.wallAhead);
    `;
    const result = forge.executeCode(code, 'javascript', grid);
    expect(result.success).toBe(true);
    expect(result.output).toContain('true');
  });

  it('rejects forbidden operations', () => {
    const code = `eval('alert(1)')`;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Forbidden');
  });

  it('rejects fetch', () => {
    const code = `fetch('https://evil.com')`;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Forbidden');
  });

  it('rejects window access', () => {
    const code = `window.location = 'https://evil.com'`;
    const result = forge.executeCode(code, 'javascript', makeGrid(10, 10));
    expect(result.success).toBe(false);
    expect(result.error).toContain('Forbidden');
  });
});

// ─── Text Code Execution: Python Subset ─────────────────────────────────────

describe('CodeForgeSystem — Python Subset Execution', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('executes simple forward', () => {
    const code = 'forward(3)';
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(3);
  });

  it('executes turn and move', () => {
    const code = `turn('right')\nforward(2)`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.y).toBe(2);
  });

  it('executes for loop with range', () => {
    const code = `for i in range(4):\n    forward(1)`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(4);
  });

  it('executes variable assignment and print', () => {
    const code = `x = 42\nprint(x)`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.output).toContain('42');
    expect(result.variables['x']).toBe(42);
  });

  it('executes if/else', () => {
    const code = `x = 10\nif x > 5:\n    forward(3)\nelse:\n    forward(1)`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(3);
  });

  it('executes while loop', () => {
    const code = `i = 0\nwhile i < 3:\n    forward(1)\n    i = i + 1`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(3);
    expect(result.variables['i']).toBe(3);
  });

  it('executes function definition and call', () => {
    const code = `def go_twice():\n    forward(2)\ngo_twice()`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(2);
  });

  it('handles comments and blank lines', () => {
    const code = `# this is a comment\n\nforward(2)\n\n# another comment`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.x).toBe(2);
  });

  it('pen_down and pen_up draw trail', () => {
    const code = `pen_down()\nforward(3)\npen_up()`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(true);
    expect(result.robotState.trail).toHaveLength(3);
    expect(result.robotState.penDown).toBe(false);
  });

  it('pick_up collects item', () => {
    const grid = makeGrid(10, 10, [], [[1, 0, 'crystal']]);
    const code = `forward(1)\npick_up()`;
    const result = forge.executeCode(code, 'python', grid);
    expect(result.success).toBe(true);
    expect(result.robotState.inventory).toContain('crystal');
  });
});

// ─── Safety: Infinite Loop Protection ───────────────────────────────────────

describe('CodeForgeSystem — Safety', () => {
  it('stops infinite loops in blocks', () => {
    const forge = new CodeForgeSystem(100);
    const program: BlockProgram = {
      blocks: [{
        blockId: 'while',
        id: 'b1',
        inputs: { condition: 'true' },
        body: [{ blockId: 'print', id: 'b2', inputs: { message: "'loop'" } }],
      }],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.success).toBe(false);
    expect(result.error).toContain('exceeded maximum');
  });

  it('stops infinite loops in Python', () => {
    const forge = new CodeForgeSystem(100);
    const code = `while True:\n    print('forever')`;
    const result = forge.executeCode(code, 'python', makeGrid(10, 10));
    expect(result.success).toBe(false);
    expect(result.error).toContain('exceeded maximum');
  });

  it('tracks step count', () => {
    const forge = new CodeForgeSystem();
    const program: BlockProgram = {
      blocks: [
        { blockId: 'move_forward', id: 'b1', inputs: { steps: 1 } },
        { blockId: 'turn', id: 'b2', inputs: { direction: 'left' } },
        { blockId: 'move_forward', id: 'b3', inputs: { steps: 1 } },
      ],
    };
    const result = forge.executeBlocks(program, makeGrid(10, 10));
    expect(result.steps).toBeGreaterThan(0);
  });
});

// ─── Robot Control API ──────────────────────────────────────────────────────

describe('CodeForgeSystem — Robot Control', () => {
  let forge: CodeForgeSystem;

  beforeEach(() => {
    forge = new CodeForgeSystem();
  });

  it('moveRobot moves state', () => {
    const state = forge.executeBlocks({ blocks: [] }, makeGrid(10, 10)).robotState;
    const moved = forge.moveRobot(state, 3, makeGrid(10, 10));
    expect(moved.x).toBe(3);
  });

  it('turnRobot changes direction', () => {
    const state = forge.executeBlocks({ blocks: [] }, makeGrid(10, 10)).robotState;
    const turned = forge.turnRobot(state, 90);
    expect(turned.direction).toBe(90);
  });

  it('turnRobot wraps around 360', () => {
    const state = forge.executeBlocks({ blocks: [] }, makeGrid(10, 10)).robotState;
    const turned = forge.turnRobot(state, -90);
    expect(turned.direction).toBe(270);
  });

  it('senseRobot detects walls', () => {
    const grid = makeGrid(10, 10, [[1, 0]]);
    const state = forge.executeBlocks({ blocks: [] }, grid).robotState;
    const data = forge.senseRobot(state, grid);
    expect(data.wallAhead).toBe(true);
  });

  it('senseRobot detects items', () => {
    const grid = makeGrid(10, 10, [], [[1, 0, 'gem']]);
    const state = forge.executeBlocks({ blocks: [] }, grid).robotState;
    const data = forge.senseRobot(state, grid);
    expect(data.objectAhead).toBe('gem');
  });

  it('senseRobot detects goals', () => {
    const grid = makeGrid(10, 10, [], [], [[1, 0]]);
    const state = forge.executeBlocks({ blocks: [] }, grid).robotState;
    const data = forge.senseRobot(state, grid);
    expect(data.objectAhead).toBe('goal');
  });

  it('moveRobot respects walls', () => {
    const grid = makeGrid(10, 10, [[2, 0]]);
    const state = forge.executeBlocks({ blocks: [] }, grid).robotState;
    const moved = forge.moveRobot(state, 5, grid);
    expect(moved.x).toBe(1);
  });

  it('moveRobot draws trail when pen down', () => {
    const grid = makeGrid(10, 10);
    let state = forge.executeBlocks({ blocks: [] }, grid).robotState;
    state = { ...state, penDown: true };
    const moved = forge.moveRobot(state, 2, grid);
    expect(moved.trail).toHaveLength(2);
  });
});
