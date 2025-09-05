import { Observable, Subject } from "rxjs";

export class DrbUtil {

  public static isCorrect(drb: string): boolean {
    let owner_type = DrbUtil.getOwnerType(drb);
    return owner_type == -1 ? false : true;
  }

  public static getOwnerType(drb: string): number {
    let ownerType = -1;
    for (let index = 0; index < DrbUtil.OwnerTypeRules.length; index++) {
      const ownerTypeItem = DrbUtil.OwnerTypeRules[index];
      let isPasPattern = ownerTypeItem.rules.some(patternRule => {
        let regex = new RegExp(patternRule, 'g');
        return regex.test(drb);
      });
      if (isPasPattern) {
        ownerType = ownerTypeItem.point;
        break;
      }
    }
    return ownerType;
  }


  public static identifyCategory(drb: string, ownerTypeId: string = ''): number {
    let owner_type: number;
    if (ownerTypeId) {
      owner_type = parseInt(ownerTypeId);
    } else {
      owner_type = DrbUtil.getOwnerType(drb);
    }
    if (![EDrbLocalOwnerType.FIZIK, EDrbLocalOwnerType.YURIK, EDrbLocalOwnerType.MOTO_SKUTER, EDrbLocalOwnerType.MOTO].includes(owner_type)) {
      return 0;
    }
    let numberPart = DrbUtil.sliceNumberPart(drb, owner_type);
    let seriasPart = DrbUtil.getDrbSeries(drb, owner_type);
    let category = DrbUtil.CategoryRules.find(catInfo => {
      return DrbUtil.checkRegex(catInfo.rules, numberPart);
    });


    let regex = new RegExp("^(.)\\1*$", 'g');
    if (regex.test(seriasPart.join('')) && !category) {
      category = DrbUtil.CategoryRules[5]
    }

    return category ? category.point : 0;
  }

  public static sliceNumberPart(drb: string, ownerTypeId: number = 0) {
    let result: string = '';
    let ownerType: number;
    if (ownerTypeId) {
      ownerType = ownerTypeId;
    } else {
      ownerType = DrbUtil.getOwnerType(drb);
    }

    if (ownerType != -1) {
      let owner = DrbUtil.OwnerTypeRules.find(v => v.point == ownerType);
      if (owner) {
        result = drb.substring(owner.numberStart, owner.numberStart + owner.numberLength);
      }
    }
    return result;
  }

  public static getDrbTextStaticPart(drb: string, ownerTypeId: number = 0) {
    let result: any[] = [];
    let ownerType: number;
    if (ownerTypeId) {
      ownerType = ownerTypeId;
    } else {
      ownerType = DrbUtil.getOwnerType(drb);
    }

    if (ownerType != -1) {
      let owner = DrbUtil.OwnerTypeRules.find(v => v.point == ownerType);
      if (owner) {
        result[0] = drb.substring(0, owner.numberStart);
        result[1] = drb.substring(owner.numberStart + owner.numberLength, drb.length);
      }
    }
    return result.join('');
  }

  public static generateNumbers(drbStart: string, drbEnd: string, ownerTypeId: number = 0, maxCount = 999, categories: string[] = []): Observable<string[] | any> {
    let result: string[] = [];
    let subject = new Subject();
    let ownerType: number;
    if (ownerTypeId) {
      ownerType = ownerTypeId;
    } else {
      ownerType = DrbUtil.getOwnerType(drbStart);
    }
    if (ownerType != -1) {
      let drbStartNum = parseInt(DrbUtil.sliceNumberPart(drbStart, ownerType));
      let drbEndNum = parseInt(DrbUtil.sliceNumberPart(drbEnd, ownerType));
      let owner = DrbUtil.OwnerTypeRules.find(v => v.point == ownerType);
      if (owner && !isNaN(drbStartNum) && !isNaN(drbEndNum) && drbStartNum <= drbEndNum) {
        let startText = drbStart.substring(0, owner.numberStart);
        let endText = drbStart.substring(owner.numberStart + owner.numberLength);
        let drbCount = Math.abs(drbEndNum - drbStartNum) + 1 > maxCount ? maxCount : Math.abs(drbEndNum - drbStartNum) + 1;
        let divN = 50;
        for (let num = 0; num <= Math.trunc(drbCount / divN); num++) {
          setTimeout(() => {
            let blockStart = drbStartNum + divN * num;

            for (let index = 0; index < divN; index++) {
              let newNumber = blockStart + index;
              if (newNumber > drbCount + drbStartNum) {
                continue;
              }
              let fullDrb = startText + (newNumber + '').padStart(owner?.numberLength || 2, '0') + endText;

              let ownertestType = ownerType;
              if (categories.length > 0 && !categories.includes(DrbUtil.identifyCategory(newNumber + '', ownertestType + '') + ''))
                continue;

              result.push(fullDrb)
              subject.next(result);
              if (result.length == drbCount) {
                subject.complete();
              }
            }
          })
        }
      } else {
        subject.complete();
      }
    } else {
      subject.complete();
    }
    return subject.asObservable();
  }

  public static getDrbSeries(drb: string, ownerTypeId: number = 0): string[] {
    let owner_type: number;
    if (ownerTypeId) {
      owner_type = ownerTypeId;
    } else {
      owner_type = DrbUtil.getOwnerType(drb);
    }
    let rule = DrbUtil.OwnerTypeRules.find(r => r.point == owner_type)
    let series: string[] = []

    if (rule?.series_length && rule?.series_length.length > 0) {
      let start_index: number = rule?.hasRegionCode ? 2 : 0
      let firstSeries = rule?.series_length[0] ? drb.slice(start_index, start_index + rule?.series_length[0]) : ''
      let secondSeries = rule?.series_length[1] ? drb.slice((-1) * rule?.series_length[1]) : ''
      series = [firstSeries, secondSeries]
    }

    return series
  }

  public static getDrbRegionCode(drb: string, ownerTypeId: number = 0): string {
    let owner_type: number;

    if (ownerTypeId) {
      owner_type = ownerTypeId;
    } else {
      owner_type = DrbUtil.getOwnerType(drb);
    }
    let rule = DrbUtil.OwnerTypeRules.find(r => r.point == owner_type)
    let region_code: string = rule?.hasRegionCode ? drb.slice(0, 2) : ''

    return region_code
  }

  public static checkRegex(regList: string[], str: string) {
    return regList.some(regexPattern => {
      let regex = new RegExp(regexPattern, 'g');
      return regex.test(str);
    });
  }


  public static getDrbRegion(drb: string) {
    let region = drb.substring(0, 2);
    let regionDbCode: number = 0;
    if (region != '' && region.length == 2) {
      let regionCode = parseInt(region);
      if (regionCode < 10) {
        regionDbCode = ERegionCodes.Tashkent_city
      } else if (regionCode < 20) {
        regionDbCode = ERegionCodes.Tashkent_region
      } else if (regionCode < 25) {
        regionDbCode = ERegionCodes.Sirdarya_region
      } else if (regionCode < 30) {
        regionDbCode = ERegionCodes.Jizzax_region
      } else if (regionCode < 40) {
        regionDbCode = ERegionCodes.Samarkand_region
      } else if (regionCode < 50) {
        regionDbCode = ERegionCodes.Fergana_region
      } else if (regionCode < 60) {
        regionDbCode = ERegionCodes.Namangan_region
      } else if (regionCode < 70) {
        regionDbCode = ERegionCodes.Andijon_region
      } else if (regionCode < 75) {
        regionDbCode = ERegionCodes.Kashkadarya_region
      } else if (regionCode < 80) {
        regionDbCode = ERegionCodes.Surxandaryo_region
      } else if (regionCode < 85) {
        regionDbCode = ERegionCodes.Buxoro_region
      } else if (regionCode < 90) {
        regionDbCode = ERegionCodes.Navoiy_region
      } else if (regionCode < 95) {
        regionDbCode = ERegionCodes.Xorazm_region
      } else if (regionCode < 95) {
        regionDbCode = ERegionCodes.Korakalpok_region
      }
    }
    return regionDbCode;
  }

  static CategoryRules = [{
    point: 1,
    rules: ["001", "007", "100", "111", "222", "555", "700", "777", "888"],
  },
  {
    point: 2,
    rules: ["002", "005", "010", "020", "050", "070", "077", "080", "101", "200", "202", "300", "333", "444", "500", "505", "707", "800", "808", "999"]
  },
  {
    point: 3,
    rules: ["003", "004", "008", "009", "011", "022", "030", "033", "040", "044", "055", "088", "090", "110", "220", "303", "400", "404", "550", "600", "701", "717", "757", "770", "900", "909"]
  },
  {
    point: 4,
    rules: ["006", "099", "330", "440", "606", "666", "702", "703", "704", "705", "706", "708", "709", "710", "711", "712", "715", "721", "722", "727", "737", "747", "767", "771", "772", "773", "774", "775", "776", "778", "779", "787", "797", "880", "990"]
  },
  {
    point: 5,
    rules: ["021", "060", "066", "102", "121", "131", "141", "151", "161", "171", "177", "181", "191", "212", "215", "232", "242", "252", "262", "272", "277", "282", "292", "313", "323", "343", "353", "373", "383", "393", "414", "424", "434", "454", "464", "474", "484", "494", "515", "525", "535", "545", "565", "570", "571", "575", "577", "585", "595", "616", "656", "660", "676", "733", "744", "755", "788", "799", "818", "828", "838", "848", "858", "878", "898", "919", "929", "939", "949", "959", "979", "989"]
  },
  {
    point: 6,
    rules: ["012", "015", "017", "071", "075", "107", "112", "113", "114", "115", "116", "117", "118", "119", "122", "123", "133", "144", "155", "166", "170", "188", "199", "201", "203", "205", "207", "210", "211", "221", "223", "224", "225", "226", "227", "228", "229", "233", "234", "244", "255", "266", "288", "299", "301", "307", "311", "322", "331", "332", "334", "335", "336", "337", "338", "339", "344", "345", "355", "366", "363", "377", "388", "399", "401", "402", "407", "411", "422", "433", "441", "442", "443", "445", "446", "447", "448", "449", "455", "456", "466", "477", "488", "499", "501", "507", "510", "511", "522", "533", "544", "551", "552", "553", "554", "556", "557", "558", "559", "564", "566", "567", "588", "599", "601", "607", "611", "622", "626", "633", "636", "644", "646", "655", "661", "662", "663", "664", "665", "667", "668", "669", "677", "678", "686", "688", "696", "699", "713", "714", "716", "718", "719", "725", "720", "723", "730", "735", "740", "750", "760", "766", "780", "786", "789", "790", "801", "807", "811", "822", "833", "844", "855", "866", "868", "877", "881", "882", "883", "884", "885", "886", "887", "889", "899", "901", "907", "911", "922", "933", "944", "955", "966", "969", "977", "988", "991", "992", "993", "994", "995", "996", "997", "998"
    ]
  }
  ]

  static OwnerTypeRules = [
    {
      point: 13,
      rules: ['^[0-9]{5}DAV$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 3],
    },
    {
      point: 1,
      rules: ['^[0-9]{5}[A-Z]{3}$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 3],
    },
    {
      point: 2,
      rules: ['^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$'],
      numberStart: 3,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [1, 2],
    },
    {
      point: 3,
      rules: ['^[0-9]{2}H[0-9]{6}$'],
      numberStart: 3,
      numberLength: 6,
      hasRegionCode: true,
      series_length: [1, 0],
    },
    {
      point: 4,
      rules: ['^[0-9]{6}[A-Z]{2}$'],
      numberStart: 2,
      numberLength: 4,
      hasRegionCode: true,
      series_length: [0, 2],
    },
    {
      point: 5,
      rules: ['^[0-9]{5}[A-Z]{2}$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 2],
    },
    {
      point: 6,
      rules: ['^PAA[0-9]{3}$'],
      numberStart: 3,
      numberLength: 3,
      hasRegionCode: false,
      series_length: [3, 0],
    },
    {
      point: 7,
      rules: ['^CMD[0-9]{4}$'],
      numberStart: 3,
      numberLength: 4,
      hasRegionCode: false,
      series_length: [3, 0],
    },
    {
      point: 8,
      rules: ['^D[0-9]{6}$'],
      numberStart: 1,
      numberLength: 6,
      hasRegionCode: false,
      series_length: [1, 0],
    },
    {
      point: 9,
      rules: ['^UN[0-9]{4}$'],
      numberStart: 2,
      numberLength: 4,
      hasRegionCode: false,
      series_length: [2, 0],
    },
    {
      point: 10,
      rules: ['^T[0-9]{6}$'],
      numberStart: 1,
      numberLength: 6,
      hasRegionCode: false,
      series_length: [1, 0],
    },
    {
      point: 11,
      rules: ['^X[0-9]{6}$'],
      numberStart: 1,
      numberLength: 6,
      hasRegionCode: false,
      series_length: [1, 0],
    },
    {
      point: 12,
      rules: ['^[0-9]{2}[A-Z]{1}[0-9]{6}$'],
      numberStart: 3,
      numberLength: 6,
      hasRegionCode: true,
      series_length: [1, 0],
    },
    {
      point: 15,
      rules: ['^[0-9]{5}[A-Z]{3}$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 3],
    },
    {
      point: 16,
      rules: ['^[0-9]{5}[A-Z]{2}$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 2],
    },
    {
      point: 17,
      rules: ['^[0-9]{5}[A-Z]{3}$'],
      numberStart: 2,
      numberLength: 3,
      hasRegionCode: true,
      series_length: [0, 3],
    },
  ]
}

export enum ERegionCodes {
  Tashkent_city = 1,
  Tashkent_region = 11,
  Sirdarya_region = 12,
  Jizzax_region = 13,
  Samarkand_region = 14,
  Fergana_region = 15,
  Namangan_region = 16,
  Andijon_region = 17,
  Kashkadarya_region = 18,
  Surxandaryo_region = 19,
  Buxoro_region = 20,
  Navoiy_region = 21,
  Xorazm_region = 22,
  Korakalpok_region = 23,
}

export enum EDrbLocalOwnerType {
  YURIK = 1,
  FIZIK = 2,
  NOT_CITIZEN = 3,
  MOTO_SKUTER = 15,
  MOTO = 5,

}

export enum EDrbOwnerType {
  OO_000MMM = 1,
  OO_M000MM = 2,
  OO_H000000 = 3,
  OO_0000MM = 4,
  OO_000MM = 5,
  PAA000 = 6,
  CMD000 = 7,
  D000000 = 8,
  UN0000 = 9,
  T000000 = 10,
  X000000 = 11,
  OO_M000000 = 12,
  OO_000DAV = 13,
  OO_OOOMMM = '15',
  OO_000HH = '16',
  OO_000HHH = '17'
}
