import * as types from "./types";
import { Rect } from "./Rect";
import { BasicEvents } from "./BasicEvents";

export abstract class BaseRenderer extends BasicEvents<types.RendererEvent, types.IRendererEvent,types.RendererEventHandler> implements types.IRenderer {

  abstract clearDrawing(params?:any, zindex?:types.RendererDrawZIndex): void;
  abstract setBackground(img?: HTMLImageElement | undefined): void;
  abstract draw(param: any, zindex?: types.RendererDrawZIndex): void;
  private curPage: types.IPage | undefined;
  abstract destroy(): void;
  get minX():number{
    return -this.renderWidth / 2;
  }
  get minY():number{
    return -this.renderHeight / 2;
  }
  get maxX():number{
    return this.getPage()!.width*this.zoom() - this.renderWidth / 2;
  }
  get maxY():number{
    return this.getPage()!.height*this.zoom() - this.renderHeight / 2;
  }
  get imgWidth(){
    return this.getPage()!.width*this.zoom();
  }
  get imgHeight(){
    return this.getPage()!.height*this.zoom();
  }
  constructor(
    protected ele: HTMLCanvasElement,
    public renderWidth: number,
    public renderHeight: number,
  ){
    super();
  }
  mouseEventToCoords(evt:types.IRendererEvent):types.IPoint{
    const e=evt.e as MouseEvent;
    return {
      x: e.offsetX,
      y: e.offsetY
    }
  }
  rendererPointToRealPoint(rendererPoint: types.IPoint): types.IPoint {
    return {
      x: Math.round(Math.min(Math.max(rendererPoint.x + this.panX(),0),this.imgWidth) / this.zoom()),
      y: Math.round(Math.min(Math.max(rendererPoint.y + this.panY(),0),this.imgHeight) / this.zoom())
    };
  }
  realPointToRendererPoint(realPoint: types.IPoint): types.IPoint {
    return {
      x: Math.round(realPoint.x * this.zoom() - this.panX()),
      y: Math.round(realPoint.y * this.zoom() - this.panY()),
    };
  }
  getPage(): types.IPage | undefined {
    return this.curPage;
    // if (this.curPage) {
      
    // } else {
    //   throw new Error("No page is rendered.");
    // }

  }
 
  abstract zoom(level?: number): number;
  abstract panX(pixel?: number): number;
  abstract panY(pixel?: number): number;
  async renderPage(page: types.IPage): Promise<any> {
    this.curPage = page;
    const img = await page.getPreview(this.zoom());
    this.setBackground(img);
  }
  realRectToRendererRect(realRect: Rect): Rect {
    return realRect.pan(-this.panX() / this.zoom(), -this.panY() / this.zoom()).zoom(this.zoom());
  }
  rendererRectToRealRect(rendererRect: Rect): Rect {
    return rendererRect.pan(this.panX(), this.panY()).zoom(1 / this.zoom());
  }
}
