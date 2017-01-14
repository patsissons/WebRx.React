import { Observable } from  'rx';
import * as wx from 'webrx';
import * as clone from 'clone';

import { Logging } from '../Utils';
import { SampleData } from './SampleData/SampleData';

export enum HttpRequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
}

export class ObservableApi {
  public static displayName = 'ObservableApi';

  private logger = Logging.getLogger(ObservableApi.displayName);
  private client = wx.injector.get<wx.IHttpClient>(wx.res.httpClient);
  protected sampleData: SampleData = null;

  constructor(public baseUri: string) {
  }

  private getNonNullParams(params?: any) {
    if (params == null) {
      return null;
    }

    for (const key in params) {
      if (params[key] == null) {
        delete params[key];
      }
    }

    return params;
  }

  private getRequest<T>(url: string, method: HttpRequestMethod, params?: any, data?: any, options?: wx.IHttpClientOptions) {
    if (method === HttpRequestMethod.POST && data === undefined && params !== undefined) {
      // we're performing a POST request but only supplying params, this likely
      // means the body was passed in as the params, so we can swap the two.
      // if this is intentional, pass in null for the data instead of leaving it blank

      data = params;
      params = null;
    }

    params = this.getNonNullParams(params);

    options = Object.assign<wx.IHttpClientOptions>({}, options, <wx.IHttpClientOptions>{
      url,
      method: method.toString(),
      params,
      data,
    });

    return this.client.request<T>(options);
  }

  public getObservable<T>(action: string, params?: any, data?: any, method: HttpRequestMethod = HttpRequestMethod.GET, options?: wx.IHttpClientOptions, baseUri?: string) {
    const uri = `${baseUri || this.baseUri}${action}`;

    this.logger.info(`Calling API: ${action} (${uri})`, params);

    return this.sampleData == null ?
      // if an API call throws an uncaught error, that means you are not subscribing to the observable's error
      Observable
        .fromPromise(this.getRequest(uri, method, params, data, options))
        .doOnNext(x => {
          this.logger.info(`API Result: ${action} (${uri})`, x);
        })
        .catch((x: { xhr: XMLHttpRequest }) => {
          this.logger.error(`API ERROR: ${action} (${uri})`, x);

          let error: any = null;

          try {
            // NOTE: timeouts can be tested by supplying options param, with an
            // xmlHttpRequest creation function that injects timeout = 1, then
            // use the following as the uri:
            // https://httpbin.org/delay/5

            // readyState = 4 is the best indicator we have to know that a timeout occurred.
            error = x.xhr.readyState === 4 ?
              'Request Timeout Error' :
              JSON.parse(x.xhr.response);
          }
          catch (e) {
            this.logger.error('Unable to Get Error Response', e);

            error = 'Unknown Error: Invalid Response from API Host';
          }

          return Observable.throw<T>(error);
        }) :
      // if sample data has been created just use that instead (opt-in)
      this.sampleData.getObservable<T>(action, params);
  }

  public getSampleData(name: string, selector: (data: any) => any) {
    const sampleData = (<any>this.sampleData || {})[name];

    return sampleData == null ? null : clone(selector(sampleData));
  }
}
