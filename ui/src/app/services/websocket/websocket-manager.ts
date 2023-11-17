import { BehaviorSubject, Observable, filter } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

export class WebSocketManager<T, K> {
  private _webSocket: WebSocketSubject<T | K>;
  private _webSocketSubject = new BehaviorSubject<T>(null as T);

  get current(): T {
    return this._webSocketSubject.value;
  }

  get socketUpdates$(): Observable<T> {
    return this._webSocketSubject.asObservable().pipe(filter(Boolean));
  }

  constructor(url: string) {
    this._webSocket = webSocket(url);
    this.connect();
  }

  next(value: K): void {
    this._webSocket.next(value);
  }

  destroy(): void {
    this._webSocket.complete();
    this._webSocketSubject.complete();
  }

  private connect(): void {
    this._webSocket.asObservable().subscribe({
      next: v => this._webSocketSubject.next(v as T),
    });
  }
}
