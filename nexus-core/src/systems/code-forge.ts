import type { MasteryTier } from '../types/components.js';
import type {
  BlockDefinition,
  BlockInputDef,
  BlockInstance,
  BlockProgram,
  CodeLanguage,
  ExecutionResult,
  GridCell,
  GridWorld,
  RobotState,
  SensorData,
} from '../types/code-forge.js';

// ─── Block Library ──────────────────────────────────────────────────────────

const TIER_ORDER: MasteryTier[] = ['foundation', 'discovery', 'builder', 'innovator', 'creator'];

function tierAtLeast(current: MasteryTier, min: MasteryTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(min);
}

function num(name: string, defaultValue = 1): BlockInputDef {
  return { name, type: 'number', defaultValue };
}

function str(name: string, defaultValue = ''): BlockInputDef {
  return { name, type: 'string', defaultValue };
}

function dir(name: string): BlockInputDef {
  return { name, type: 'direction', options: ['left', 'right'], defaultValue: 'left' };
}

function expr(name: string): BlockInputDef {
  return { name, type: 'expression' };
}

function varInput(name: string): BlockInputDef {
  return { name, type: 'variable' };
}

const BLOCK_LIBRARY: BlockDefinition[] = [
  // ── Foundation: basic movement ──
  { id: 'move_forward', category: 'motion', label: 'Move Forward', description: 'Move the robot forward by a number of steps', minTier: 'foundation', inputs: [num('steps')], hasBody: false, hasElse: false },
  { id: 'turn', category: 'motion', label: 'Turn', description: 'Turn the robot left or right', minTier: 'foundation', inputs: [dir('direction')], hasBody: false, hasElse: false },
  { id: 'repeat', category: 'control', label: 'Repeat', description: 'Repeat the enclosed blocks N times', minTier: 'foundation', inputs: [num('times', 2)], hasBody: true, hasElse: false },

  // ── Discovery: control flow, variables, events ──
  { id: 'if', category: 'logic', label: 'If', description: 'Execute blocks if condition is true', minTier: 'discovery', inputs: [expr('condition')], hasBody: true, hasElse: false },
  { id: 'if_else', category: 'logic', label: 'If / Else', description: 'Execute blocks based on condition', minTier: 'discovery', inputs: [expr('condition')], hasBody: true, hasElse: true },
  { id: 'while', category: 'control', label: 'While', description: 'Repeat blocks while condition is true', minTier: 'discovery', inputs: [expr('condition')], hasBody: true, hasElse: false },
  { id: 'set_variable', category: 'data', label: 'Set Variable', description: 'Set a variable to a value', minTier: 'discovery', inputs: [varInput('name'), expr('value')], hasBody: false, hasElse: false },
  { id: 'wait', category: 'control', label: 'Wait', description: 'Pause execution for N steps', minTier: 'discovery', inputs: [num('steps', 1)], hasBody: false, hasElse: false },
  { id: 'on_event', category: 'event', label: 'On Event', description: 'Trigger when event occurs', minTier: 'discovery', inputs: [str('event', 'start')], hasBody: true, hasElse: false },
  { id: 'sense', category: 'logic', label: 'Sense', description: 'Check a sensor reading', minTier: 'discovery', inputs: [str('sensor', 'wallAhead')], hasBody: false, hasElse: false },
  { id: 'pick_up', category: 'motion', label: 'Pick Up', description: 'Pick up an item at current position', minTier: 'discovery', inputs: [], hasBody: false, hasElse: false },
  { id: 'place', category: 'motion', label: 'Place', description: 'Place an item from inventory', minTier: 'discovery', inputs: [str('item', '')], hasBody: false, hasElse: false },
  { id: 'pen_down', category: 'motion', label: 'Pen Down', description: 'Start drawing a trail', minTier: 'discovery', inputs: [], hasBody: false, hasElse: false },
  { id: 'pen_up', category: 'motion', label: 'Pen Up', description: 'Stop drawing', minTier: 'discovery', inputs: [], hasBody: false, hasElse: false },
  { id: 'set_pen_color', category: 'motion', label: 'Set Pen Color', description: 'Change the pen color', minTier: 'discovery', inputs: [str('color', '#22d3ee')], hasBody: false, hasElse: false },
  { id: 'print', category: 'data', label: 'Print', description: 'Print a message to the output', minTier: 'discovery', inputs: [expr('message')], hasBody: false, hasElse: false },

  // ── Builder: functions, lists, algorithms, strings ──
  { id: 'define_function', category: 'function', label: 'Define Function', description: 'Define a reusable function', minTier: 'builder', inputs: [str('name', 'myFunction'), str('params', '')], hasBody: true, hasElse: false },
  { id: 'call_function', category: 'function', label: 'Call Function', description: 'Call a defined function', minTier: 'builder', inputs: [str('name', ''), str('args', '')], hasBody: false, hasElse: false },
  { id: 'return', category: 'function', label: 'Return', description: 'Return a value from a function', minTier: 'builder', inputs: [expr('value')], hasBody: false, hasElse: false },
  { id: 'create_list', category: 'list', label: 'Create List', description: 'Create a new list', minTier: 'builder', inputs: [varInput('name')], hasBody: false, hasElse: false },
  { id: 'add_to_list', category: 'list', label: 'Add to List', description: 'Add an item to a list', minTier: 'builder', inputs: [varInput('list'), expr('item')], hasBody: false, hasElse: false },
  { id: 'list_length', category: 'list', label: 'List Length', description: 'Get the length of a list', minTier: 'builder', inputs: [varInput('list')], hasBody: false, hasElse: false },
  { id: 'get_from_list', category: 'list', label: 'Get from List', description: 'Get an item at an index', minTier: 'builder', inputs: [varInput('list'), num('index', 0)], hasBody: false, hasElse: false },
  { id: 'for_each', category: 'control', label: 'For Each', description: 'Iterate over a list', minTier: 'builder', inputs: [varInput('item'), varInput('list')], hasBody: true, hasElse: false },
  { id: 'string_join', category: 'string', label: 'Join Strings', description: 'Combine two strings', minTier: 'builder', inputs: [expr('a'), expr('b')], hasBody: false, hasElse: false },
  { id: 'string_length', category: 'string', label: 'String Length', description: 'Get the length of a string', minTier: 'builder', inputs: [expr('text')], hasBody: false, hasElse: false },
  { id: 'math_op', category: 'operator', label: 'Math', description: 'Perform a math operation', minTier: 'builder', inputs: [expr('left'), str('op', '+'), expr('right')], hasBody: false, hasElse: false },
  { id: 'compare', category: 'operator', label: 'Compare', description: 'Compare two values', minTier: 'builder', inputs: [expr('left'), str('op', '=='), expr('right')], hasBody: false, hasElse: false },

  // ── Innovator: text coding, recursion, data structures ──
  { id: 'text_code', category: 'advanced', label: 'Code Block', description: 'Write code in Python or JavaScript', minTier: 'innovator', inputs: [str('language', 'python'), str('code', '')], hasBody: false, hasElse: false },
  { id: 'create_dict', category: 'data', label: 'Create Dictionary', description: 'Create a key-value dictionary', minTier: 'innovator', inputs: [varInput('name')], hasBody: false, hasElse: false },
  { id: 'set_in_dict', category: 'data', label: 'Set in Dictionary', description: 'Set a key-value pair', minTier: 'innovator', inputs: [varInput('dict'), str('key'), expr('value')], hasBody: false, hasElse: false },
  { id: 'get_from_dict', category: 'data', label: 'Get from Dictionary', description: 'Get a value by key', minTier: 'innovator', inputs: [varInput('dict'), str('key')], hasBody: false, hasElse: false },

  // ── Creator: advanced algorithms, ML basics ──
  { id: 'sort_list', category: 'advanced', label: 'Sort List', description: 'Sort a list', minTier: 'creator', inputs: [varInput('list'), str('order', 'ascending')], hasBody: false, hasElse: false },
  { id: 'filter_list', category: 'advanced', label: 'Filter List', description: 'Filter a list with a condition', minTier: 'creator', inputs: [varInput('list'), varInput('item'), expr('condition')], hasBody: false, hasElse: false },
  { id: 'map_list', category: 'advanced', label: 'Map List', description: 'Transform each item in a list', minTier: 'creator', inputs: [varInput('list'), varInput('item'), expr('transform')], hasBody: true, hasElse: false },
  { id: 'try_catch', category: 'advanced', label: 'Try / Catch', description: 'Handle errors gracefully', minTier: 'creator', inputs: [varInput('error')], hasBody: true, hasElse: true },
];

// ─── Default Robot State ────────────────────────────────────────────────────

function defaultGridWorld(): GridWorld {
  const cells: GridCell[][] = [];
  for (let y = 0; y < 10; y++) {
    cells[y] = [];
    for (let x = 0; x < 10; x++) {
      cells[y]![x] = { type: 'empty' };
    }
  }
  return { width: 10, height: 10, cells, robotStart: { x: 0, y: 0, direction: 0 }, goals: [] };
}

// ─── Code Forge System ──────────────────────────────────────────────────────

const MAX_STEPS = 10_000;
const MAX_OUTPUT_LINES = 500;

export class CodeForgeSystem {
  private readonly maxSteps: number;
  private readonly maxOutput: number;

  constructor(maxSteps = MAX_STEPS, maxOutput = MAX_OUTPUT_LINES) {
    this.maxSteps = maxSteps;
    this.maxOutput = maxOutput;
  }

  // ─── Block Library ──────────────────────────────────────────────────

  getAvailableBlocks(tier: MasteryTier): BlockDefinition[] {
    return BLOCK_LIBRARY.filter(b => tierAtLeast(tier, b.minTier));
  }

  getBlock(blockId: string): BlockDefinition | undefined {
    return BLOCK_LIBRARY.find(b => b.id === blockId);
  }

  // ─── Block Execution ────────────────────────────────────────────────

  executeBlocks(program: BlockProgram, world?: GridWorld): ExecutionResult {
    const ctx = new ExecutionContext(world ?? defaultGridWorld(), this.maxSteps, this.maxOutput);

    try {
      for (const block of program.blocks) {
        ctx.execute(block);
        if (ctx.halted) break;
      }
    } catch (err) {
      return {
        success: false,
        output: ctx.output,
        robotState: ctx.robot,
        error: err instanceof Error ? err.message : String(err),
        steps: ctx.steps,
        variables: { ...ctx.variables },
      };
    }

    return {
      success: !ctx.error,
      output: ctx.output,
      robotState: ctx.robot,
      error: ctx.error ?? undefined,
      steps: ctx.steps,
      variables: { ...ctx.variables },
    };
  }

  // ─── Text Code Execution ────────────────────────────────────────────

  executeCode(code: string, language: CodeLanguage, world?: GridWorld): ExecutionResult {
    const ctx = new ExecutionContext(world ?? defaultGridWorld(), this.maxSteps, this.maxOutput);

    try {
      if (language === 'javascript') {
        this.executeJavaScript(code, ctx);
      } else if (language === 'python') {
        this.executePythonSubset(code, ctx);
      } else {
        throw new Error(`Unsupported language: ${language as string}`);
      }
    } catch (err) {
      return {
        success: false,
        output: ctx.output,
        robotState: ctx.robot,
        error: err instanceof Error ? err.message : String(err),
        steps: ctx.steps,
        variables: { ...ctx.variables },
      };
    }

    return {
      success: true,
      output: ctx.output,
      robotState: ctx.robot,
      steps: ctx.steps,
      variables: { ...ctx.variables },
    };
  }

  // ─── Robot Control ──────────────────────────────────────────────────

  moveRobot(state: RobotState, steps: number, world?: GridWorld): RobotState {
    const grid = world ?? defaultGridWorld();
    const copy = deepCloneRobot(state);
    for (let i = 0; i < steps; i++) {
      const rad = (copy.direction * Math.PI) / 180;
      const nx = Math.round(copy.x + Math.cos(rad)) || 0;
      const ny = Math.round(copy.y + Math.sin(rad)) || 0;
      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) break;
      const cell = grid.cells[ny]?.[nx];
      if (cell?.type === 'wall') break;
      const from = { x: copy.x, y: copy.y };
      copy.x = nx;
      copy.y = ny;
      if (copy.penDown) {
        copy.trail.push({ from, to: { x: nx, y: ny }, color: copy.penColor });
      }
    }
    copy.sensorData = computeSensors(copy, grid);
    return copy;
  }

  turnRobot(state: RobotState, degrees: number): RobotState {
    const copy = deepCloneRobot(state);
    copy.direction = ((copy.direction + degrees) % 360 + 360) % 360;
    return copy;
  }

  senseRobot(state: RobotState, world?: GridWorld): SensorData {
    return computeSensors(state, world ?? defaultGridWorld());
  }

  // ─── JavaScript Execution (sandboxed) ─────────────────────────────

  private executeJavaScript(code: string, ctx: ExecutionContext): void {
    // Provide a safe API surface
    const api = ctx.buildAPI();

    // Validate no dangerous patterns
    this.validateCode(code);

    // Build function body
    const paramNames = Object.keys(api);
    const paramValues = Object.values(api);

    try {
      const fn = new Function(...paramNames, code);
      fn(...paramValues);
    } catch (err) {
      throw new Error(`JavaScript error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── Python-like Subset Interpreter ───────────────────────────────

  private executePythonSubset(code: string, ctx: ExecutionContext): void {
    const lines = code.split('\n');
    this.interpretLines(lines, 0, ctx);
  }

  private interpretLines(lines: string[], baseIndent: number, ctx: ExecutionContext): void {
    let i = 0;
    while (i < lines.length) {
      ctx.stepCheck();
      if (ctx.halted) return;

      const rawLine = lines[i]!;
      const trimmed = rawLine.trim();
      if (trimmed === '' || trimmed.startsWith('#')) { i++; continue; }

      const indent = rawLine.search(/\S/);
      if (indent < baseIndent) return;

      // Variable assignment: name = value
      const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.startsWith('if ') && !trimmed.startsWith('while ') && !trimmed.startsWith('for ') && !trimmed.startsWith('def ')) {
        const varName = assignMatch[1]!;
        const val = ctx.evaluateExpression(assignMatch[2]!);
        ctx.variables[varName] = val;
        i++;
        continue;
      }

      // print(...)
      const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
      if (printMatch) {
        const val = ctx.evaluateExpression(printMatch[1]!);
        ctx.addOutput(String(val));
        i++;
        continue;
      }

      // Robot commands
      if (this.tryRobotCommand(trimmed, ctx)) { i++; continue; }

      // for i in range(n):
      const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\((.+)\)\s*:$/);
      if (forMatch) {
        const varName = forMatch[1]!;
        const n = Number(ctx.evaluateExpression(forMatch[2]!));
        const body = this.collectBlock(lines, i + 1, indent);
        for (let j = 0; j < n && !ctx.halted; j++) {
          ctx.variables[varName] = j;
          this.interpretLines(body, indent + 1, ctx);
        }
        i += 1 + body.length;
        continue;
      }

      // while condition:
      const whileMatch = trimmed.match(/^while\s+(.+)\s*:$/);
      if (whileMatch) {
        const condExpr = whileMatch[1]!;
        const body = this.collectBlock(lines, i + 1, indent);
        while (ctx.evaluateBool(condExpr) && !ctx.halted) {
          this.interpretLines(body, indent + 1, ctx);
        }
        i += 1 + body.length;
        continue;
      }

      // if condition:
      const ifMatch = trimmed.match(/^if\s+(.+)\s*:$/);
      if (ifMatch) {
        const condExpr = ifMatch[1]!;
        const body = this.collectBlock(lines, i + 1, indent);
        let consumed = 1 + body.length;
        let elseBody: string[] = [];

        // Check for else
        const nextIdx = i + consumed;
        if (nextIdx < lines.length) {
          const nextTrimmed = lines[nextIdx]!.trim();
          if (nextTrimmed === 'else:') {
            elseBody = this.collectBlock(lines, nextIdx + 1, indent);
            consumed += 1 + elseBody.length;
          }
        }

        if (ctx.evaluateBool(condExpr)) {
          this.interpretLines(body, indent + 1, ctx);
        } else if (elseBody.length > 0) {
          this.interpretLines(elseBody, indent + 1, ctx);
        }
        i += consumed;
        continue;
      }

      // def function_name(params):
      const defMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
      if (defMatch) {
        const fname = defMatch[1]!;
        const params = defMatch[2]!.split(',').map(p => p.trim()).filter(Boolean);
        const body = this.collectBlock(lines, i + 1, indent);
        ctx.functions[fname] = { params, body, indent: indent + 1 };
        i += 1 + body.length;
        continue;
      }

      // Function call: name(args)
      const callMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/);
      if (callMatch) {
        const fname = callMatch[1]!;
        const args = callMatch[2]!.split(',').map(a => ctx.evaluateExpression(a.trim()));
        const func = ctx.functions[fname];
        if (func) {
          const saved: Record<string, unknown> = {};
          for (let p = 0; p < func.params.length; p++) {
            const pname = func.params[p]!;
            saved[pname] = ctx.variables[pname];
            ctx.variables[pname] = args[p];
          }
          this.interpretLines(func.body, func.indent, ctx);
          for (const pname of func.params) {
            ctx.variables[pname] = saved[pname];
          }
        }
        i++;
        continue;
      }

      // Unknown line — skip
      i++;
    }
  }

  private collectBlock(lines: string[], start: number, parentIndent: number): string[] {
    const block: string[] = [];
    for (let i = start; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim() === '') { block.push(line); continue; }
      const indent = line.search(/\S/);
      if (indent <= parentIndent) break;
      block.push(line);
    }
    return block;
  }

  private tryRobotCommand(line: string, ctx: ExecutionContext): boolean {
    const fwdMatch = line.match(/^(?:move_forward|forward)\s*\((\d+)\)$/);
    if (fwdMatch) { ctx.robotForward(Number(fwdMatch[1])); return true; }

    const turnMatch = line.match(/^turn\s*\(\s*['"]?(left|right)['"]?\s*\)$/);
    if (turnMatch) { ctx.robotTurn(turnMatch[1] === 'left' ? -90 : 90); return true; }

    const turnDegMatch = line.match(/^turn\s*\(\s*(-?\d+)\s*\)$/);
    if (turnDegMatch) { ctx.robotTurn(Number(turnDegMatch[1])); return true; }

    if (line === 'pick_up()') { ctx.robotPickUp(); return true; }
    if (line === 'pen_down()') { ctx.robot.penDown = true; return true; }
    if (line === 'pen_up()') { ctx.robot.penDown = false; return true; }

    const colorMatch = line.match(/^set_pen_color\s*\(\s*['"](.+)['"]\s*\)$/);
    if (colorMatch) { ctx.robot.penColor = colorMatch[1]!; return true; }

    const senseMatch = line.match(/^sense\s*\(\s*\)$/);
    if (senseMatch) {
      ctx.robot.sensorData = computeSensors(ctx.robot, ctx.world);
      return true;
    }

    return false;
  }

  private validateCode(code: string): void {
    const forbidden = ['eval(', 'Function(', 'import(', 'require(', 'process.', 'window.', 'document.', 'globalThis.', 'XMLHttpRequest', 'fetch(', 'localStorage', 'sessionStorage', 'cookie'];
    const lower = code.toLowerCase();
    for (const pattern of forbidden) {
      if (lower.includes(pattern.toLowerCase())) {
        throw new Error(`Forbidden operation: ${pattern} is not allowed in Code Forge`);
      }
    }
  }
}

// ─── Execution Context ──────────────────────────────────────────────────────

class ExecutionContext {
  robot: RobotState;
  readonly world: GridWorld;
  readonly output: string[] = [];
  readonly variables: Record<string, unknown> = {};
  readonly functions: Record<string, { params: string[]; body: string[]; indent: number }> = {};
  steps = 0;
  halted = false;
  error: string | null = null;
  private readonly maxSteps: number;
  private readonly maxOutput: number;

  constructor(world: GridWorld, maxSteps: number, maxOutput: number) {
    this.world = world;
    this.robot = {
      x: world.robotStart.x,
      y: world.robotStart.y,
      direction: world.robotStart.direction,
      penDown: false,
      penColor: '#22d3ee',
      trail: [],
      inventory: [],
      sensorData: computeSensors(
        { x: world.robotStart.x, y: world.robotStart.y, direction: world.robotStart.direction } as RobotState,
        world,
      ),
    };
    this.maxSteps = maxSteps;
    this.maxOutput = maxOutput;
  }

  stepCheck(): void {
    this.steps++;
    if (this.steps > this.maxSteps) {
      this.halted = true;
      this.error = `Program exceeded maximum of ${this.maxSteps} steps (infinite loop?)`;
      throw new Error(this.error);
    }
  }

  addOutput(line: string): void {
    if (this.output.length < this.maxOutput) {
      this.output.push(line);
    }
  }

  // ─── Robot Commands ─────────────────────────────────────────────────

  robotForward(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.stepCheck();
      const rad = (this.robot.direction * Math.PI) / 180;
      const nx = Math.round(this.robot.x + Math.cos(rad)) || 0;
      const ny = Math.round(this.robot.y + Math.sin(rad)) || 0;
      if (nx < 0 || nx >= this.world.width || ny < 0 || ny >= this.world.height) break;
      const cell = this.world.cells[ny]?.[nx];
      if (cell?.type === 'wall') break;
      const from = { x: this.robot.x, y: this.robot.y };
      this.robot.x = nx;
      this.robot.y = ny;
      if (this.robot.penDown) {
        this.robot.trail.push({ from, to: { x: nx, y: ny }, color: this.robot.penColor });
      }
    }
    this.robot.sensorData = computeSensors(this.robot, this.world);
  }

  robotTurn(degrees: number): void {
    this.stepCheck();
    this.robot.direction = ((this.robot.direction + degrees) % 360 + 360) % 360;
    this.robot.sensorData = computeSensors(this.robot, this.world);
  }

  robotPickUp(): void {
    this.stepCheck();
    const cell = this.world.cells[this.robot.y]?.[this.robot.x];
    if (cell?.type === 'item' && cell.item) {
      this.robot.inventory.push(cell.item);
      cell.type = 'empty';
      cell.item = undefined;
    }
  }

  // ─── Expression Evaluation ──────────────────────────────────────────

  evaluateExpression(expr: string): unknown {
    this.stepCheck();
    const trimmed = expr.trim();

    // String literal
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      return trimmed.slice(1, -1);
    }

    // Boolean
    if (trimmed === 'true' || trimmed === 'True') return true;
    if (trimmed === 'false' || trimmed === 'False') return false;

    // Number
    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== '') return num;

    // Sensor access
    if (trimmed.startsWith('sensor.') || trimmed.startsWith('sense.')) {
      const key = trimmed.split('.')[1];
      if (key && key in this.robot.sensorData) {
        return this.robot.sensorData[key as keyof SensorData];
      }
    }

    // Variable
    if (trimmed in this.variables) return this.variables[trimmed];

    // Simple binary operation: left op right
    const opMatch = trimmed.match(/^(.+?)\s*(==|!=|>=|<=|>|<|\+|-|\*|\/|%|and|or)\s*(.+)$/);
    if (opMatch) {
      const left = this.evaluateExpression(opMatch[1]!);
      const op = opMatch[2]!;
      const right = this.evaluateExpression(opMatch[3]!);
      return this.applyOp(left, op, right);
    }

    // "not" prefix
    if (trimmed.startsWith('not ')) {
      return !this.evaluateBool(trimmed.slice(4));
    }

    // len(list)
    const lenMatch = trimmed.match(/^len\((\w+)\)$/);
    if (lenMatch) {
      const val = this.variables[lenMatch[1]!];
      if (Array.isArray(val)) return val.length;
      if (typeof val === 'string') return val.length;
      return 0;
    }

    return trimmed;
  }

  evaluateBool(expr: string): boolean {
    const val = this.evaluateExpression(expr);
    return Boolean(val);
  }

  private applyOp(left: unknown, op: string, right: unknown): unknown {
    const l = typeof left === 'number' ? left : Number(left);
    const r = typeof right === 'number' ? right : Number(right);

    switch (op) {
      case '+': {
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
        return l + r;
      }
      case '-': return l - r;
      case '*': return l * r;
      case '/': return r === 0 ? 0 : l / r;
      case '%': return r === 0 ? 0 : l % r;
      case '==': return left == right; // eslint-disable-line eqeqeq
      case '!=': return left != right; // eslint-disable-line eqeqeq
      case '>': return l > r;
      case '<': return l < r;
      case '>=': return l >= r;
      case '<=': return l <= r;
      case 'and': return Boolean(left) && Boolean(right);
      case 'or': return Boolean(left) || Boolean(right);
      default: return false;
    }
  }

  // ─── Block Execution ────────────────────────────────────────────────

  execute(block: BlockInstance): void {
    this.stepCheck();
    if (this.halted) return;

    const def = BLOCK_LIBRARY.find(b => b.id === block.blockId);
    if (!def) throw new Error(`Unknown block: ${block.blockId}`);

    switch (block.blockId) {
      case 'move_forward': {
        const steps = Number(block.inputs['steps'] ?? 1);
        this.robotForward(steps);
        break;
      }
      case 'turn': {
        const dir = String(block.inputs['direction'] ?? 'left');
        this.robotTurn(dir === 'left' ? -90 : 90);
        break;
      }
      case 'repeat': {
        const times = Number(block.inputs['times'] ?? 2);
        for (let i = 0; i < times && !this.halted; i++) {
          this.executeBody(block.body);
        }
        break;
      }
      case 'if': {
        if (this.evaluateBool(String(block.inputs['condition'] ?? 'false'))) {
          this.executeBody(block.body);
        }
        break;
      }
      case 'if_else': {
        if (this.evaluateBool(String(block.inputs['condition'] ?? 'false'))) {
          this.executeBody(block.body);
        } else {
          this.executeBody(block.elseBody);
        }
        break;
      }
      case 'while': {
        while (this.evaluateBool(String(block.inputs['condition'] ?? 'false')) && !this.halted) {
          this.executeBody(block.body);
        }
        break;
      }
      case 'set_variable': {
        const name = String(block.inputs['name'] ?? '');
        this.variables[name] = this.evaluateExpression(String(block.inputs['value'] ?? '0'));
        break;
      }
      case 'wait': break; // No-op in non-real-time execution
      case 'sense': {
        this.robot.sensorData = computeSensors(this.robot, this.world);
        break;
      }
      case 'pick_up': {
        this.robotPickUp();
        break;
      }
      case 'place': {
        const item = String(block.inputs['item'] ?? '');
        const idx = this.robot.inventory.indexOf(item);
        if (idx >= 0) {
          this.robot.inventory.splice(idx, 1);
          const cell = this.world.cells[this.robot.y]?.[this.robot.x];
          if (cell && cell.type === 'empty') {
            cell.type = 'item';
            cell.item = item;
          }
        }
        break;
      }
      case 'pen_down': { this.robot.penDown = true; break; }
      case 'pen_up': { this.robot.penDown = false; break; }
      case 'set_pen_color': { this.robot.penColor = String(block.inputs['color'] ?? '#22d3ee'); break; }
      case 'print': {
        const msg = this.evaluateExpression(String(block.inputs['message'] ?? ''));
        this.addOutput(String(msg));
        break;
      }
      case 'define_function': {
        const fname = String(block.inputs['name'] ?? '');
        const paramStr = String(block.inputs['params'] ?? '');
        const params = paramStr ? paramStr.split(',').map(p => p.trim()) : [];
        this.functions[fname] = { params, body: [], indent: 0 };
        // Store body blocks for later call
        if (block.body) {
          (this.functions[fname]! as FunctionDef).blockBody = block.body;
        }
        break;
      }
      case 'call_function': {
        const fname = String(block.inputs['name'] ?? '');
        const func = this.functions[fname] as FunctionDef | undefined;
        if (func?.blockBody) {
          const argStr = String(block.inputs['args'] ?? '');
          const args = argStr ? argStr.split(',').map(a => this.evaluateExpression(a.trim())) : [];
          const saved: Record<string, unknown> = {};
          for (let p = 0; p < func.params.length; p++) {
            const pname = func.params[p]!;
            saved[pname] = this.variables[pname];
            this.variables[pname] = args[p];
          }
          this.executeBody(func.blockBody);
          for (const pname of func.params) {
            this.variables[pname] = saved[pname];
          }
        }
        break;
      }
      case 'return': {
        // Simple: store return value in __return__
        this.variables['__return__'] = this.evaluateExpression(String(block.inputs['value'] ?? ''));
        break;
      }
      case 'create_list': {
        const name = String(block.inputs['name'] ?? '');
        this.variables[name] = [];
        break;
      }
      case 'add_to_list': {
        const listName = String(block.inputs['list'] ?? '');
        const val = this.evaluateExpression(String(block.inputs['item'] ?? ''));
        const list = this.variables[listName];
        if (Array.isArray(list)) list.push(val);
        break;
      }
      case 'list_length': {
        const listName = String(block.inputs['list'] ?? '');
        const list = this.variables[listName];
        this.variables['__return__'] = Array.isArray(list) ? list.length : 0;
        break;
      }
      case 'get_from_list': {
        const listName = String(block.inputs['list'] ?? '');
        const idx = Number(block.inputs['index'] ?? 0);
        const list = this.variables[listName];
        this.variables['__return__'] = Array.isArray(list) ? list[idx] : undefined;
        break;
      }
      case 'for_each': {
        const itemVar = String(block.inputs['item'] ?? 'item');
        const listName = String(block.inputs['list'] ?? '');
        const list = this.variables[listName];
        if (Array.isArray(list)) {
          for (const item of list) {
            if (this.halted) break;
            this.variables[itemVar] = item;
            this.executeBody(block.body);
          }
        }
        break;
      }
      case 'string_join': {
        const a = String(this.evaluateExpression(String(block.inputs['a'] ?? '')));
        const b = String(this.evaluateExpression(String(block.inputs['b'] ?? '')));
        this.variables['__return__'] = a + b;
        break;
      }
      case 'string_length': {
        const text = String(this.evaluateExpression(String(block.inputs['text'] ?? '')));
        this.variables['__return__'] = text.length;
        break;
      }
      case 'math_op': {
        const left = this.evaluateExpression(String(block.inputs['left'] ?? '0'));
        const op = String(block.inputs['op'] ?? '+');
        const right = this.evaluateExpression(String(block.inputs['right'] ?? '0'));
        this.variables['__return__'] = this.applyOp(left, op, right);
        break;
      }
      case 'compare': {
        const left = this.evaluateExpression(String(block.inputs['left'] ?? '0'));
        const op = String(block.inputs['op'] ?? '==');
        const right = this.evaluateExpression(String(block.inputs['right'] ?? '0'));
        this.variables['__return__'] = this.applyOp(left, op, right);
        break;
      }
      case 'create_dict': {
        const name = String(block.inputs['name'] ?? '');
        this.variables[name] = {};
        break;
      }
      case 'set_in_dict': {
        const dictName = String(block.inputs['dict'] ?? '');
        const key = String(block.inputs['key'] ?? '');
        const val = this.evaluateExpression(String(block.inputs['value'] ?? ''));
        const dict = this.variables[dictName];
        if (dict && typeof dict === 'object' && !Array.isArray(dict)) {
          (dict as Record<string, unknown>)[key] = val;
        }
        break;
      }
      case 'get_from_dict': {
        const dictName = String(block.inputs['dict'] ?? '');
        const key = String(block.inputs['key'] ?? '');
        const dict = this.variables[dictName];
        if (dict && typeof dict === 'object' && !Array.isArray(dict)) {
          this.variables['__return__'] = (dict as Record<string, unknown>)[key];
        }
        break;
      }
      case 'sort_list': {
        const listName = String(block.inputs['list'] ?? '');
        const order = String(block.inputs['order'] ?? 'ascending');
        const list = this.variables[listName];
        if (Array.isArray(list)) {
          list.sort((a: unknown, b: unknown) => {
            const na = Number(a);
            const nb = Number(b);
            if (!isNaN(na) && !isNaN(nb)) return order === 'ascending' ? na - nb : nb - na;
            return order === 'ascending' ? String(a).localeCompare(String(b)) : String(b).localeCompare(String(a));
          });
        }
        break;
      }
      case 'filter_list': {
        const listName = String(block.inputs['list'] ?? '');
        const itemVar = String(block.inputs['item'] ?? 'item');
        const condExpr = String(block.inputs['condition'] ?? 'true');
        const list = this.variables[listName];
        if (Array.isArray(list)) {
          const result: unknown[] = [];
          for (const item of list) {
            this.variables[itemVar] = item;
            if (this.evaluateBool(condExpr)) result.push(item);
          }
          this.variables[listName] = result;
        }
        break;
      }
      case 'map_list': {
        const listName = String(block.inputs['list'] ?? '');
        const itemVar = String(block.inputs['item'] ?? 'item');
        const list = this.variables[listName];
        if (Array.isArray(list) && block.body) {
          const result: unknown[] = [];
          for (const item of list) {
            this.variables[itemVar] = item;
            this.executeBody(block.body);
            result.push(this.variables['__return__']);
          }
          this.variables[listName] = result;
        }
        break;
      }
      case 'try_catch': {
        const errorVar = String(block.inputs['error'] ?? 'error');
        try {
          this.executeBody(block.body);
        } catch (err) {
          this.variables[errorVar] = err instanceof Error ? err.message : String(err);
          this.halted = false;
          this.error = null;
          this.executeBody(block.elseBody);
        }
        break;
      }
      case 'text_code': {
        // Inline text code from a block — delegate to text execution
        const lang = String(block.inputs['language'] ?? 'javascript') as CodeLanguage;
        const code = String(block.inputs['code'] ?? '');
        if (lang === 'javascript') {
          const forge = new CodeForgeSystem(this.maxSteps - this.steps, this.maxOutput - this.output.length);
          const result = forge.executeCode(code, 'javascript', this.world);
          this.output.push(...result.output);
          Object.assign(this.variables, result.variables);
          this.steps += result.steps;
          Object.assign(this.robot, result.robotState);
        }
        break;
      }
      default:
        break;
    }
  }

  private executeBody(blocks?: BlockInstance[]): void {
    if (!blocks) return;
    for (const block of blocks) {
      if (this.halted) return;
      this.execute(block);
    }
  }

  // ─── API for JavaScript sandbox ─────────────────────────────────────

  buildAPI(): Record<string, unknown> {
    return {
      move_forward: (steps: number) => this.robotForward(steps),
      forward: (steps: number) => this.robotForward(steps),
      turn: (dir: string | number) => {
        if (typeof dir === 'string') {
          this.robotTurn(dir === 'left' ? -90 : 90);
        } else {
          this.robotTurn(dir);
        }
      },
      turn_left: () => this.robotTurn(-90),
      turn_right: () => this.robotTurn(90),
      pick_up: () => this.robotPickUp(),
      pen_down: () => { this.robot.penDown = true; },
      pen_up: () => { this.robot.penDown = false; },
      set_pen_color: (c: string) => { this.robot.penColor = c; },
      sense: () => {
        this.robot.sensorData = computeSensors(this.robot, this.world);
        return { ...this.robot.sensorData };
      },
      print: (msg: unknown) => this.addOutput(String(msg)),
      get_x: () => this.robot.x,
      get_y: () => this.robot.y,
      get_direction: () => this.robot.direction,
      get_inventory: () => [...this.robot.inventory],
    };
  }
}

// ─── Helper type for stored functions with block bodies ─────────────────────

interface FunctionDef {
  params: string[];
  body: string[];
  indent: number;
  blockBody?: BlockInstance[];
}

// ─── Deep Clone Helper ──────────────────────────────────────────────────────

function deepCloneRobot(state: RobotState): RobotState {
  return {
    x: state.x,
    y: state.y,
    direction: state.direction,
    penDown: state.penDown,
    penColor: state.penColor,
    trail: state.trail.map(t => ({
      from: { ...t.from },
      to: { ...t.to },
      color: t.color,
    })),
    inventory: [...state.inventory],
    sensorData: { ...state.sensorData },
  };
}

// ─── Sensor Computation ─────────────────────────────────────────────────────

function computeSensors(robot: RobotState | { x: number; y: number; direction: number }, world: GridWorld): SensorData {
  const rad = (robot.direction * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const aheadX = Math.round(robot.x + cos);
  const aheadY = Math.round(robot.y + sin);

  const leftRad = ((robot.direction - 90) * Math.PI) / 180;
  const leftX = Math.round(robot.x + Math.cos(leftRad));
  const leftY = Math.round(robot.y + Math.sin(leftRad));

  const rightRad = ((robot.direction + 90) * Math.PI) / 180;
  const rightX = Math.round(robot.x + Math.cos(rightRad));
  const rightY = Math.round(robot.y + Math.sin(rightRad));

  function isWall(x: number, y: number): boolean {
    if (x < 0 || x >= world.width || y < 0 || y >= world.height) return true;
    return world.cells[y]?.[x]?.type === 'wall';
  }

  function getObject(x: number, y: number): string | null {
    if (x < 0 || x >= world.width || y < 0 || y >= world.height) return null;
    const cell = world.cells[y]?.[x];
    if (cell?.type === 'item') return cell.item ?? null;
    if (cell?.type === 'goal') return 'goal';
    return null;
  }

  // Distance to wall ahead
  let distanceToWall = 0;
  for (let d = 1; d <= Math.max(world.width, world.height); d++) {
    const cx = Math.round(robot.x + cos * d);
    const cy = Math.round(robot.y + sin * d);
    if (cx < 0 || cx >= world.width || cy < 0 || cy >= world.height || world.cells[cy]?.[cx]?.type === 'wall') {
      distanceToWall = d;
      break;
    }
  }
  if (distanceToWall === 0) distanceToWall = Math.max(world.width, world.height);

  const currentCell = world.cells[robot.y]?.[robot.x];

  return {
    wallAhead: isWall(aheadX, aheadY),
    wallLeft: isWall(leftX, leftY),
    wallRight: isWall(rightX, rightY),
    objectAhead: getObject(aheadX, aheadY),
    currentTile: currentCell?.type ?? 'empty',
    distanceToWall,
  };
}
