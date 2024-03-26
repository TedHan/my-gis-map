import { HttpClient } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// @ts-ignore
window['createCustomSACCannonElement'] = createCustomElement;

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

    // @ts-ignore
    window['sacCannonInjector'] = this.injector; // 暴露出依赖
  }

  registerEl(tagName: string, cla: any) {
    customElements.define(tagName, cla);
  }

  // TODO:依赖注入只会注入到源组件上，在extends的组件上无依赖注入能力。
  // 因此如果想要有依赖注入能力，需要手动将源组件的依赖在实例化子组件时注入到源组件super中。
  ngDoBootstrap() {
    // @ts-ignore
    window['SACCannonComponent'] = AppComponent;
    // @ts-ignore
    const sacCannon = createCustomSACCannonElement(AppComponent, {
      injector: this.injector,
    });
    sacCannon.prototype.getEchartsOption = function () {
      const ins = this._ngElementStrategy.componentRef.instance;
      return ins.getEchartsOption();
    };
    sacCannon.prototype.applyEchartsOption = function (option: any) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.applyEchartsOption(option);
    };
    sacCannon.prototype.createWorldMap = function () {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.createWorldMap();
    };
    sacCannon.prototype.createMapCannon = function (
      icons: any,
      lines: any,
      points: any,
      interval: any,
      tooltipCountLabel: any,
      tooltipChartLabel: any
    ) {
      const ins = this._ngElementStrategy.componentRef.instance;
      ins.createMapCannon(
        icons,
        lines,
        points,
        interval,
        tooltipCountLabel,
        tooltipChartLabel
      );
    };
    this.registerEl('sac-cannon', sacCannon);
  }
}
