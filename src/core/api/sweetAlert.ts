import Swal from 'sweetalert2';

// SweetAlert2 默认配置
const defaultConfig = {
  confirmButtonColor: '#4A90E2',
  cancelButtonColor: '#6c757d',
  background: 'rgba(255, 255, 255, 0.95)',
  backdrop: 'rgba(0, 0, 0, 0.4)',
  customClass: {
    popup: 'meowos-popup',
    title: 'meowos-title',
    content: 'meowos-content',
    confirmButton: 'meowos-confirm-btn',
    cancelButton: 'meowos-cancel-btn'
  },
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  }
};

// 创建配置好的 SweetAlert2 实例
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: 'rgba(255, 255, 255, 0.9)',
  backdrop: false,
  customClass: {
    popup: 'meowos-toast'
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// 预设的弹窗类型
export const sweetAlert = {
  // 成功提示
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      ...defaultConfig
    });
  },

  // 错误提示
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      ...defaultConfig
    });
  },

  // 警告提示
  warning: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      ...defaultConfig
    });
  },

  // 信息提示
  info: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      ...defaultConfig
    });
  },

  // 确认对话框
  confirm: (title: string, text?: string, confirmButtonText: string = '确认', cancelButtonText: string = '取消') => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      ...defaultConfig
    });
  },

  // 输入对话框
  input: (title: string, inputPlaceholder?: string, inputValue?: string) => {
    return Swal.fire({
      title,
      input: 'text',
      inputPlaceholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value) {
          return '请输入内容！';
        }
      },
      ...defaultConfig
    });
  },

  // 加载中提示
  loading: (title: string = '加载中...') => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      ...defaultConfig
    });
  },

  // 简单的消息提示（替代 alert）
  alert: (message: string, title?: string) => {
    return Swal.fire({
      title: title || '提示',
      text: message,
      icon: 'info',
      confirmButtonText: '确定',
      ...defaultConfig
    });
  },

  // Toast 消息
  toast: {
    success: (message: string) => {
      return Toast.fire({
        icon: 'success',
        title: message
      });
    },
    error: (message: string) => {
      return Toast.fire({
        icon: 'error',
        title: message
      });
    },
    warning: (message: string) => {
      return Toast.fire({
        icon: 'warning',
        title: message
      });
    },
    info: (message: string) => {
      return Toast.fire({
        icon: 'info',
        title: message
      });
    }
  }
};

// 导出原始 Swal 实例，以便需要完全自定义时使用
export { Swal };

// 默认导出配置好的 sweetAlert
export default sweetAlert;
