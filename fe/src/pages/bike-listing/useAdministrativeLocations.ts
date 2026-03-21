import { useEffect, useMemo, useState } from 'react'
import { vietnamProvincesApi } from '@/api/vietnam-provinces.api'
import { findAdministrativeOptionByName, type AdministrativeOption } from '@/lib/vietnamese-provinces'

interface UseAdministrativeLocationsProps {
  ward: string
  province: string
  district: string
}

export function useAdministrativeLocations({
  ward,
  province,
  district,
}: UseAdministrativeLocationsProps) {
  const [provinceOptions, setProvinceOptions] = useState<AdministrativeOption[]>([])
  const [districtOptions, setDistrictOptions] = useState<AdministrativeOption[]>([])
  const [wardOptions, setWardOptions] = useState<AdministrativeOption[]>([])
  const [provinceOptionsLoading, setProvinceOptionsLoading] = useState(true)
  const [districtOptionsLoading, setDistrictOptionsLoading] = useState(false)
  const [wardOptionsLoading, setWardOptionsLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadProvinceOptions() {
      setProvinceOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getAll()

        if (!ignore) {
          setProvinceOptions(result)
        }
      } catch {
        if (!ignore) {
          setProvinceOptions([])
        }
      } finally {
        if (!ignore) {
          setProvinceOptionsLoading(false)
        }
      }
    }

    void loadProvinceOptions()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const selectedProvince = findAdministrativeOptionByName(provinceOptions, province)

    if (!selectedProvince) {
      setDistrictOptions([])
      setWardOptions([])
      setDistrictOptionsLoading(false)
      setWardOptionsLoading(false)
      return
    }

    const selectedProvinceCode = selectedProvince.code
    let ignore = false

    async function loadDistrictOptions() {
      setDistrictOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getDistricts(selectedProvinceCode)

        if (!ignore) {
          setDistrictOptions(result)
        }
      } catch {
        if (!ignore) {
          setDistrictOptions([])
        }
      } finally {
        if (!ignore) {
          setDistrictOptionsLoading(false)
        }
      }
    }

    void loadDistrictOptions()

    return () => {
      ignore = true
    }
  }, [province, provinceOptions])

  useEffect(() => {
    const selectedDistrict = findAdministrativeOptionByName(districtOptions, district)

    if (!selectedDistrict) {
      setWardOptions([])
      setWardOptionsLoading(false)
      return
    }

    const selectedDistrictCode = selectedDistrict.code
    let ignore = false

    async function loadWardOptions() {
      setWardOptionsLoading(true)

      try {
        const result = await vietnamProvincesApi.getWards(selectedDistrictCode)

        if (!ignore) {
          setWardOptions(result)
        }
      } catch {
        if (!ignore) {
          setWardOptions([])
        }
      } finally {
        if (!ignore) {
          setWardOptionsLoading(false)
        }
      }
    }

    void loadWardOptions()

    return () => {
      ignore = true
    }
  }, [district, districtOptions])

  const selectedProvinceOption = useMemo(
    () => findAdministrativeOptionByName(provinceOptions, province),
    [province, provinceOptions],
  )
  const selectedDistrictOption = useMemo(
    () => findAdministrativeOptionByName(districtOptions, district),
    [district, districtOptions],
  )
  const selectedWardOption = useMemo(
    () => findAdministrativeOptionByName(wardOptions, ward),
    [ward, wardOptions],
  )

  return {
    districtOptions,
    districtOptionsLoading,
    provinceOptions,
    provinceOptionsLoading,
    selectedDistrictOption,
    selectedProvinceOption,
    selectedWardOption,
    wardOptions,
    wardOptionsLoading,
  }
}
