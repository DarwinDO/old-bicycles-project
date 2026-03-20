import { describe, expect, it } from 'vitest'
import {
  buildVietnamDistrictOptions,
  buildVietnamProvinceOptions,
  buildVietnamWardOptions,
  findAdministrativeOptionByName,
  stripDistrictPrefix,
  stripProvincePrefix,
  stripWardPrefix,
} from './vietnamese-provinces'

describe('vietnamese-provinces helpers', () => {
  it('strips administrative prefixes for province, district, and ward names', () => {
    expect(stripProvincePrefix('Thành phố Hà Nội')).toBe('Hà Nội')
    expect(stripDistrictPrefix('Quận Đống Đa')).toBe('Đống Đa')
    expect(stripWardPrefix('Phường Bến Nghé')).toBe('Bến Nghé')
  })

  it('builds normalized option lists for each administrative level', () => {
    expect(
      buildVietnamProvinceOptions([
        {
          code: 1,
          name: 'Thành phố Hà Nội',
          codename: 'ha_noi',
          division_type: 'thành phố trung ương',
          phone_code: 24,
        },
      ]),
    ).toEqual([
      {
        code: 1,
        name: 'Hà Nội',
        rawName: 'Thành phố Hà Nội',
      },
    ])

    expect(
      buildVietnamDistrictOptions([
        {
          code: 2,
          name: 'Quận Hoàn Kiếm',
          codename: 'quan_hoan_kiem',
          division_type: 'quận',
          province_code: 1,
        },
      ]),
    ).toEqual([
      {
        code: 2,
        name: 'Hoàn Kiếm',
        rawName: 'Quận Hoàn Kiếm',
      },
    ])

    expect(
      buildVietnamWardOptions([
        {
          code: 3,
          name: 'Phường Hàng Trống',
          codename: 'phuong_hang_trong',
          division_type: 'phường',
          district_code: 2,
        },
      ]),
    ).toEqual([
      {
        code: 3,
        name: 'Hàng Trống',
        rawName: 'Phường Hàng Trống',
      },
    ])
  })

  it('matches option names using normalized Vietnamese text', () => {
    const provinces = buildVietnamProvinceOptions([
      {
        code: 1,
        name: 'Thành phố Hà Nội',
        codename: 'ha_noi',
        division_type: 'thành phố trung ương',
        phone_code: 24,
      },
    ])

    expect(findAdministrativeOptionByName(provinces, 'ha noi')?.name).toBe('Hà Nội')
    expect(findAdministrativeOptionByName(provinces, 'Thành phố Hà Nội')?.name).toBe('Hà Nội')
  })
})
