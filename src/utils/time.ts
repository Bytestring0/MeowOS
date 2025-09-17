/**
 * 时间工具类
 * 提供日期格式化、节日查询等功能
 */

export interface Holiday {
  name: string;
  date: string;
  type: 'traditional' | 'modern' | 'international';
  description?: string;
}

export interface TimeFormatOptions {
  showSeconds?: boolean;
  showDate?: boolean;
  format24Hour?: boolean;
  locale?: string;
}

export class TimeUtils {
  // 获取当前时间戳
  static now(): number {
    return Date.now();
  }

  // 格式化时间
  static formatTime(date: Date = new Date(), options: TimeFormatOptions = {}): string {
    const {
      showSeconds = true,
      showDate = true,
      format24Hour = true,
      locale = 'zh-CN'
    } = options;

    const formatOptions: Intl.DateTimeFormatOptions = {
      ...(showDate && {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: !format24Hour
    };

    return date.toLocaleString(locale, formatOptions);
  }

  // 获取相对时间（如：2小时前）
  static getRelativeTime(date: Date, locale: string = 'zh-CN'): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}天前`;
    if (diffHours > 0) return `${diffHours}小时前`;
    if (diffMinutes > 0) return `${diffMinutes}分钟前`;
    return '刚刚';
  }

  // 获取今天是周几
  static getWeekday(date: Date = new Date(), locale: string = 'zh-CN'): string {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  // 获取农历信息（简化版）
  static getLunarInfo(date: Date = new Date()): { year: string; month: string; day: string } {
    // 这里是简化实现，实际可以接入更完整的农历库
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 简单的天干地支计算
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    
    return {
      year: `${heavenlyStems[stemIndex]}${earthlyBranches[branchIndex]}年 (${zodiac[branchIndex]}年)`,
      month: `${month}月`,
      day: `${day}日`
    };
  }

  // 获取重要节日
  static getHolidays(year: number = new Date().getFullYear()): Holiday[] {
    return [
      // 传统节日
      { name: '春节', date: `${year}-02-10`, type: 'traditional', description: '农历新年，中华民族最重要的传统节日' },
      { name: '元宵节', date: `${year}-02-24`, type: 'traditional', description: '农历正月十五，赏灯猜谜的节日' },
      { name: '清明节', date: `${year}-04-04`, type: 'traditional', description: '祭祖扫墓，踏青游玩的节日' },
      { name: '端午节', date: `${year}-06-10`, type: 'traditional', description: '纪念屈原，赛龙舟吃粽子' },
      { name: '七夕节', date: `${year}-08-04`, type: 'traditional', description: '中国情人节，牛郎织女相会' },
      { name: '中秋节', date: `${year}-09-15`, type: 'traditional', description: '团圆节，赏月吃月饼' },
      { name: '重阳节', date: `${year}-10-04`, type: 'traditional', description: '登高望远，敬老节' },
      
      // 现代节日
      { name: '元旦', date: `${year}-01-01`, type: 'modern', description: '公历新年' },
      { name: '国庆节', date: `${year}-10-01`, type: 'modern', description: '中华人民共和国成立纪念日' },
      { name: '劳动节', date: `${year}-05-01`, type: 'modern', description: '国际劳动节' },
      
      // 国际节日
      { name: '情人节', date: `${year}-02-14`, type: 'international', description: '西方情人节' },
      { name: '妇女节', date: `${year}-03-08`, type: 'international', description: '国际妇女节' },
      { name: '愚人节', date: `${year}-04-01`, type: 'international', description: '愚人节，开玩笑的节日' },
      { name: '儿童节', date: `${year}-06-01`, type: 'international', description: '国际儿童节' },
      { name: '圣诞节', date: `${year}-12-25`, type: 'international', description: '西方圣诞节' },
    ];
  }

  // 获取今天的节日
  static getTodayHolidays(date: Date = new Date()): Holiday[] {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    return this.getHolidays(year).filter(holiday => holiday.date === today);
  }

  // 判断是否是节假日
  static isHoliday(date: Date = new Date()): boolean {
    return this.getTodayHolidays(date).length > 0;
  }

  // 获取下一个节日
  static getNextHoliday(date: Date = new Date()): Holiday | null {
    const year = date.getFullYear();
    const currentDate = date.toISOString().split('T')[0];
    
    const holidays = [
      ...this.getHolidays(year),
      ...this.getHolidays(year + 1)
    ].filter(holiday => holiday.date > currentDate);
    
    return holidays.length > 0 ? holidays[0] : null;
  }

  // 计算两个日期间的差值
  static getDaysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }

  // 获取本月天数
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  // 获取星座
  static getZodiacSign(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const signs = [
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [1, 19] }
    ];

    for (const sign of signs) {
      if (
        (month === sign.start[0] && day >= sign.start[1]) ||
        (month === sign.end[0] && day <= sign.end[1])
      ) {
        return sign.name;
      }
    }
    
    return '摩羯座'; // 默认
  }
}

export default TimeUtils;
