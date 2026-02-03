import { makeAutoObservable, runInAction } from 'mobx';
import dayjs from 'dayjs';
import {
  fetchDistricts,
  fetchForecast,
  fetchRollingForecast,
  fetchRollingForecastAll,
} from '@/api/client';
import { DEMO_SITE_MAP, DEMO_SITES } from '@/constants/demoSites';
import type { ForecastDataFormat } from '@/types/mytko';
import type { RollingForecastRow, RollingForecastSummary } from '@/api/client';

const FALLBACK_PRESET = DEMO_SITES[0];
const DEFAULT_START = (import.meta as any).env?.VITE_MYTKO_DEFAULT_START ?? FALLBACK_PRESET.start;
const DEFAULT_END = (import.meta as any).env?.VITE_MYTKO_DEFAULT_END ?? FALLBACK_PRESET.end;
const DEFAULT_SITE = (import.meta as any).env?.VITE_MYTKO_DEFAULT_SITE ?? FALLBACK_PRESET.id;

class ForecastStore {
  siteId = DEFAULT_SITE;
  startDate = DEFAULT_START;
  endDate = DEFAULT_END;
  vehicleVolume = 22;
  loading = false;
  error: string | null = null;
  data: ForecastDataFormat = [];

  // NEW: Rolling cutoff mode
  cutoffDate: string | null = null;  // null = use legacy mode
  horizonDays: number = 7;
  rollingMode: boolean = false;      // true = use rolling forecast API
  rollingSummary: RollingForecastSummary | null = null;
  districtFilter: string | null = null;
  availableDistricts: string[] = [];
  searchTerm = '';
  allSitesData: RollingForecastRow[] = [];
  allSitesTotalRows = 0;
  allSitesPage = 1;
  allSitesPageSize = 50;

  constructor() {
    makeAutoObservable(this);
  }

  setSiteId(value: string) {
    this.siteId = value.trim();
  }

  setDateRange(start: string, end: string) {
    this.startDate = start;
    this.endDate = end;
  }

  setPresetRange(siteId: string) {
    const preset = DEMO_SITE_MAP.get(siteId);
    if (!preset) {
      return null;
    }
    this.setDateRange(preset.start, preset.end);
    return preset;
  }

  selectPreset(siteId: string) {
    this.setSiteId(siteId);
    return this.setPresetRange(siteId);
  }

  setVehicleVolume(value: number) {
    this.vehicleVolume = value;
  }

  // NEW setters for rolling cutoff
  setCutoffDate(value: string | null) {
    this.cutoffDate = value;
  }

  setHorizonDays(value: number) {
    this.horizonDays = Math.max(1, Math.min(365, value));
  }

  setRollingMode(value: boolean) {
    this.rollingMode = value;
  }

  setDistrictFilter(value: string | null) {
    this.districtFilter = value;
  }

  setSearchTerm(value: string) {
    this.searchTerm = value;
  }

  async loadDistricts() {
    try {
      const districts = await fetchDistricts();
      runInAction(() => {
        this.availableDistricts = districts;
      });
    } catch (err) {
      console.error('Failed to load districts', err);
    }
  }

  async load() {
    if (this.rollingMode && this.cutoffDate) {
      return this.loadRolling();
    }
    if (!this.siteId) {
      this.error = 'Укажите site_id';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const payload = await fetchForecast({
        siteId: this.siteId,
        startDate: this.startDate,
        endDate: this.endDate,
        vehicleVolume: this.vehicleVolume,
      });
      runInAction(() => {
        this.data = payload;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Не удалось загрузить прогноз';
        this.data = [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadRolling() {
    if (!this.cutoffDate) {
      this.error = 'Укажите дату среза';
      return;
    }
    if (!this.siteId) {
      return this.loadRollingAllSites(1, this.allSitesPageSize);
    }
    this.loading = true;
    this.error = null;
    try {
      const result = await fetchRollingForecast({
        cutoffDate: this.cutoffDate,
        horizonDays: this.horizonDays,
        siteId: this.siteId || undefined,
        district: this.districtFilter || undefined,
      });
      runInAction(() => {
        if ('points' in result) {
          // Single-site response
          this.data = result.points.map((p: any) => ({
            date: p.date,
            isFact: false,
            isEmpty: p.pred_mass_kg <= 0,
            vehicleVolume: this.vehicleVolume,
            overallVolume: p.pred_mass_kg / 1000,
            overallWeight: p.pred_mass_kg,
            tripMeasurements: null,
            dividedToTrips: false,
            overallMileage: null,
            isMixed: null,
          }));
          this.allSitesData = [];
          this.allSitesTotalRows = 0;
        } else {
          // Summary response
          this.rollingSummary = result;
          this.data = [];
          this.allSitesData = result.rows ?? [];
          this.allSitesTotalRows = result.total_rows ?? 0;
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadRollingAllSites(page = 1, pageSize = 50) {
    if (!this.cutoffDate) {
      this.error = 'Укажите дату среза';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const offset = (page - 1) * pageSize;
      const result = await fetchRollingForecastAll({
        cutoffDate: this.cutoffDate,
        horizonDays: this.horizonDays,
        district: this.districtFilter || undefined,
        search: this.searchTerm || undefined,
        limit: pageSize,
        offset,
      });
      runInAction(() => {
        this.allSitesData = result.rows ?? [];
        this.allSitesTotalRows = result.total_rows ?? 0;
        this.allSitesPage = page;
        this.allSitesPageSize = pageSize;
        this.rollingSummary = result;
        this.data = [];
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const forecastStore = new ForecastStore();
