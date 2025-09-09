import { defineComponent, ref, computed } from 'vue';
import { storage } from '../../core/api/storage';

export default defineComponent({
  name: 'CalculatorApp',
  setup() {
    const display = ref('0');
    const previousValue = ref(0);
    const operation = ref<string | null>(null);
    const waitingForOperand = ref(false);
    const history = ref<string[]>([]);
    const showHistory = ref(false);
    const memory = ref(0);
    const APP_ID = 'system-calculator';

    // 加载历史记录
    const loadHistory = async () => {
      const savedHistory = await storage.getAppSetting(APP_ID, 'history');
      if (savedHistory) {
        history.value = savedHistory;
      }
    };

    // 保存历史记录
    const saveHistory = async () => {
      await storage.setAppSetting(APP_ID, 'history', history.value);
    };

    const addToHistory = (calculation: string) => {
      history.value.unshift(calculation);
      if (history.value.length > 50) {
        history.value = history.value.slice(0, 50);
      }
      saveHistory();
    };

    const inputNumber = (num: string) => {
      if (waitingForOperand.value) {
        display.value = num;
        waitingForOperand.value = false;
      } else {
        display.value = display.value === '0' ? num : display.value + num;
      }
    };

    const inputDecimal = () => {
      if (waitingForOperand.value) {
        display.value = '0.';
        waitingForOperand.value = false;
      } else if (display.value.indexOf('.') === -1) {
        display.value += '.';
      }
    };

    const clear = () => {
      display.value = '0';
      previousValue.value = 0;
      operation.value = null;
      waitingForOperand.value = false;
    };

    const clearEntry = () => {
      display.value = '0';
    };

    const backspace = () => {
      if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
      } else {
        display.value = '0';
      }
    };

    const performOperation = (nextOperation: string) => {
      const inputValue = parseFloat(display.value);

      if (previousValue.value === 0) {
        previousValue.value = inputValue;
      } else if (operation.value) {
        const currentValue = previousValue.value || 0;
        const newValue = calculate(currentValue, inputValue, operation.value);

        display.value = String(newValue);
        previousValue.value = newValue;
      }

      waitingForOperand.value = true;
      operation.value = nextOperation;
    };

    const calculate = (firstValue: number, secondValue: number, operation: string): number => {
      switch (operation) {
        case '+':
          return firstValue + secondValue;
        case '-':
          return firstValue - secondValue;
        case '*':
          return firstValue * secondValue;
        case '/':
          return secondValue !== 0 ? firstValue / secondValue : 0;
        case '%':
          return firstValue % secondValue;
        case '^':
          return Math.pow(firstValue, secondValue);
        default:
          return secondValue;
      }
    };

    const performCalculation = () => {
      if (operation.value && !waitingForOperand.value) {
        const inputValue = parseFloat(display.value);
        const currentValue = previousValue.value || 0;
        const result = calculate(currentValue, inputValue, operation.value);

        const calculation = `${currentValue} ${operation.value} ${inputValue} = ${result}`;
        addToHistory(calculation);

        display.value = String(result);
        previousValue.value = 0;
        operation.value = null;
        waitingForOperand.value = true;
      }
    };

    const performScientificFunction = (func: string) => {
      const inputValue = parseFloat(display.value);
      let result: number;

      switch (func) {
        case 'sqrt':
          result = Math.sqrt(inputValue);
          break;
        case 'sin':
          result = Math.sin(inputValue * Math.PI / 180);
          break;
        case 'cos':
          result = Math.cos(inputValue * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(inputValue * Math.PI / 180);
          break;
        case 'log':
          result = Math.log10(inputValue);
          break;
        case 'ln':
          result = Math.log(inputValue);
          break;
        case 'exp':
          result = Math.exp(inputValue);
          break;
        case '1/x':
          result = inputValue !== 0 ? 1 / inputValue : 0;
          break;
        case 'x2':
          result = inputValue * inputValue;
          break;
        case 'abs':
          result = Math.abs(inputValue);
          break;
        case 'pi':
          result = Math.PI;
          break;
        case 'e':
          result = Math.E;
          break;
        default:
          result = inputValue;
      }

      const calculation = `${func}(${inputValue}) = ${result}`;
      addToHistory(calculation);

      display.value = String(result);
      waitingForOperand.value = true;
    };

    const memoryStore = () => {
      memory.value = parseFloat(display.value);
    };

    const memoryRecall = () => {
      display.value = String(memory.value);
      waitingForOperand.value = true;
    };

    const memoryClear = () => {
      memory.value = 0;
    };

    const memoryAdd = () => {
      memory.value += parseFloat(display.value);
    };

    const clearHistory = () => {
      history.value = [];
      saveHistory();
    };

    const formatDisplay = computed(() => {
      const num = parseFloat(display.value);
      if (isNaN(num)) return display.value;
      
      if (num > 999999999 || num < -999999999) {
        return num.toExponential(6);
      }
      
      return display.value;
    });

    // 初始化时加载历史记录
    loadHistory();

    return {
      display: formatDisplay,
      history,
      showHistory,
      memory,
      inputNumber,
      inputDecimal,
      clear,
      clearEntry,
      backspace,
      performOperation,
      performCalculation,
      performScientificFunction,
      memoryStore,
      memoryRecall,
      memoryClear,
      memoryAdd,
      clearHistory,
    };
  },
});
