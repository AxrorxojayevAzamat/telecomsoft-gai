import { Component, Input } from '@angular/core';
import { DrbUtil, EDrbOwnerType } from '../../utils/DrbUtil';

@Component({
  selector: 'tsg-drb-number',
  templateUrl: './tsg-drb-number.component.html',
  styleUrls: ['./tsg-drb-number.component.scss'],
})

export class TsgDrbNumber {

  @Input() set drb(value: string) {
    if (value) {
      this._drb = value;
      this.initializeStates()
    } else {
      this.clearStates()
    }

  }

  _drb!: string;
  series: string[] = [];
  number!: string;
  regionCode!: string;
  cssClass!: string;
  @Input() ownerType!: number;
  @Input() colorMode: 'default' | 'gray' = 'default';
  @Input() size: 'middle' | 'big' | 'very_big' = 'middle';


  private getCssClass(): string {
    let owner_type = <EDrbOwnerType>this.ownerType
    let css_class = ''
    switch (owner_type) {
      case EDrbOwnerType.CMD000:
      case EDrbOwnerType.D000000:
      case EDrbOwnerType.T000000:
      case EDrbOwnerType.X000000:
      case EDrbOwnerType.OO_M000000:
      case EDrbOwnerType.OO_OOOMMM:
        css_class = 'greenDrbNum'; break;
      case EDrbOwnerType.UN0000:
        css_class = 'blueDrbNum'; break;
      case EDrbOwnerType.OO_H000000:
      case EDrbOwnerType.OO_000HH:
      case EDrbOwnerType.OO_000HHH:
        css_class = 'yellowDrbNum';
        break;
    }

    return css_class;
  }

  initializeStates() {
    if (!this.ownerType) {
      this.ownerType = DrbUtil.getOwnerType(this._drb)
    }
    this.series = DrbUtil.getDrbSeries(this._drb, this.ownerType)
    this.number = DrbUtil.sliceNumberPart(this._drb, this.ownerType)
    this.regionCode = DrbUtil.getDrbRegionCode(this._drb, this.ownerType)

    this.cssClass = this.getCssClass()
  }

  clearStates() {
    this.series = []
    this.number = ''
    this.regionCode = ''
    this.ownerType = -1
    this.cssClass = ''
  }
}
