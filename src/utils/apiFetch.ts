/**
 * API获取工具类
 * 提供一言等外部API的封装
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface HitokotoResponse {
  id: string;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who?: string;
  creator: string;
  creator_uid: string;
  reviewer: string;
  commit_from: string;
  created_at: string;
  length: number;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
}

export interface JokeResponse {
  error: boolean;
  category: string;
  type: string;
  joke?: string;
  setup?: string;
  delivery?: string;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
  };
  id: number;
  safe: boolean;
  lang: string;
}

export interface PoetryResponse {
  status: string;
  data: {
    id: string;
    content: string;
    popularity: number;
    origin: {
      title: string;
      dynasty: string;
      author: string;
      content: string[];
      translate?: string[];
    };
    matchTags: string[];
    recommendedReason: string;
    cacheAt: string;
  };
  token: string;
  ipAddress: string;
}

export class ApiFetch {
  private static readonly CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  private static readonly TIMEOUT = 10000; // 10秒超时

  // 通用请求方法
  private static async request<T>(
    url: string,
    options: RequestInit = {},
    useProxy: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const requestUrl = useProxy ? `${this.CORS_PROXY}${encodeURIComponent(url)}` : url;

      const response = await fetch(requestUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP Error: ${response.status} ${response.statusText}`,
          code: response.status,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '请求失败',
      };
    }
  }

  // 获取一言
  static async getHitokoto(type?: string): Promise<ApiResponse<HitokotoResponse>> {
    const typeParam = type ? `?c=${type}` : '';
    return this.request<HitokotoResponse>(`https://v1.hitokoto.cn/${typeParam}`);
  }

  static async getRandomACGIMG(): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>(`https://t.alcy.cc/moez`);
  }

  static async getRandomACGBGIMG(): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>(`https://api.paugram.com/wallpaper/`);
  }

  // 获取笑话
  static async getJoke(category: string = 'Any'): Promise<ApiResponse<JokeResponse>> {
    return this.request<JokeResponse>(`https://v2.jokeapi.dev/joke/${category}?lang=zh`, {}, true);
  }

  // 获取诗词
  static async getPoetry(): Promise<ApiResponse<PoetryResponse>> {
    return this.request<PoetryResponse>('https://v1.jinrishici.com/all.json', {}, true);
  }

  // 获取随机图片
  static async getRandomImage(
    width: number = 800,
    height: number = 600,
    category?: string
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      const categoryParam = category ? `/${category}` : '';
      const url = `https://picsum.photos${categoryParam}/${width}/${height}`;

      return {
        success: true,
        data: { url },
      };
    } catch (error) {
      return {
        success: false,
        error: '获取随机图片失败',
      };
    }
  }

  // 获取IP信息
  static async getIpInfo(): Promise<ApiResponse<any>> {
    return this.request('https://ipapi.co/json/', {}, true);
  }

  // 获取二维码
  static generateQRCode(text: string, size: number = 200): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  }

  static async getFortune(
    type: string,
    time: string
  ) {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };
    return fetch(`https://v2.xxapi.cn/api/horoscope?type=${type}&time=${time}`, requestOptions as RequestInit);
}

  // 批量请求
  static async batchRequest<T>(
    requests: Array<() => Promise<ApiResponse<T>>>
  ): Promise<ApiResponse<T>[]> {
    try {
      const results = await Promise.allSettled(requests.map(req => req()));

      return results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason?.message || '请求失败',
          };
        }
      });
    } catch (error) {
      return [
        {
          success: false,
          error: '批量请求失败',
        },
      ];
    }
  }
}

export default ApiFetch;
