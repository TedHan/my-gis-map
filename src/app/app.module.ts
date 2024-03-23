import { HttpClient } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

//@ts-ignore
window['createCustomElement2'] = createCustomElement;

@NgModule({
  declarations: [],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [],
})
export class AppModule {
  injector;
  constructor(private parentInjector: Injector) {
    this.injector = Injector.create({
      providers: [HttpClient],
      parent: this.parentInjector,
    });
    //@ts-ignore
    window['injector2'] = this.injector; // 暴露出依赖
  }
  registerEl(tagName: string, cla: any) {
    // // 解决 extends 的组件无依赖问题
    // const oldIframe = document.querySelector('iframe');
    // let iframe: any;
    // if (!oldIframe) {
    //   iframe = document.createElement('iframe');
    //   iframe.style.display = 'none';
    // } else {
    //   oldIframe!.style.display = 'none';
    //   iframe = oldIframe;
    // }
    // let com = document.createElement(tagName);
    // iframe.append(com);
    // if (!oldIframe) {
    //   setTimeout(() => (document.body ? document.body.append(iframe) : ''));
    // }
    // if (customElements.get(tagName)) {
    //   console.warn('企图注册相同名称的标签:', tagName);
    // } else {
    //   //定义组件
    //   customElements.define(tagName, cla);
    // }
    customElements.define(tagName, cla);
  }
  // TODO:依赖注入只会注入到源组件上，在extends的组件上无依赖注入能力。
  // 因此如果想要有依赖注入能力，需要手动将源组件的依赖在实例化子组件时注入到源组件super中。
  ngDoBootstrap() {
    // @ts-ignore gis-map
    window['GisMapComponent'] = AppComponent;
    //@ts-ignore
    const gisMap = createCustomElement2(AppComponent, {
      injector: this.injector,
    });
    gisMap.prototype.applyMigrationData = function (list: any[]) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.applyMigrationData(list);
    };
    gisMap.prototype.applyScatter = function (list: any[]) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.applyScatter(list);
    };
    gisMap.prototype.renderPolygon = function (city: string) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.renderPolygon(city);
    };
    gisMap.prototype.setTileSource = function (source: string) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.setTileSource(source);
    };
    gisMap.prototype.focus = function (coods: number[], zoom: number) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.focus(coods, zoom);
    };
    gisMap.prototype.getEchartsOption = function () {
      const ins = this._ngElementStrategy.componentRef.instance;
      return ins.getEchartsOption();
    };
    gisMap.prototype.applyEchartsOption = function (option: any) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.applyEchartsOption(option);
    };
    this.registerEl('sac-cannon', gisMap);
  }
}
