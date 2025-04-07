import { Component } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  constructor(private animationCtrl: AnimationController) {}

  getTabAnimation(baseEl: HTMLElement) {
    return this.animationCtrl
      .create()
      .addElement(baseEl.querySelector('ion-router-outlet') as HTMLElement || document.createElement('div'))
      .duration(300)
      .fromTo('opacity', '0.2', '1')
      .fromTo('transform', 'translateY(40px)', 'translateY(0px)');
  }
}
