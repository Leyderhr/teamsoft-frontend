<script>
import { ref, reactive, watch, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

export default {
  name: 'PvDataList',
  components: { DataTable, Column, Toolbar, Button, InputText, Dropdown },
  props: {
    columns: { type: Array, required: true },
    dataSource: { type: [Array, String, Function], required: true },
    pagination: { type: Object, default: () => ({ server: true, page: 1, pageSize: 20, pageSizes: [10,20,50] }) },
    sorting: { type: Object, default: () => ({ field: null, order: null }) },
    filters: { type: Object, default: () => ({}) },
    actions: { type: Array, default: () => [] },
    toolbar: { type: Object, default: null },
    i18n: { type: [Object, Function], default: null },
    rowKey: { type: String, default: 'id' },
    enableSearch: { type: Boolean, default: true },
    showFilters: { type: Boolean, default: false },
    loading: { type: Boolean, default: null }
  },
  setup(props, { emit }) {
    const rows = ref([]);
    const total = ref(0);
    const page = ref(props.pagination.page || 1);
    const pageSize = ref(props.pagination.pageSize || 20);
    const pageSizes = ref(props.pagination.pageSizes || [10,20,50]);
    const sort = reactive({ field: props.sorting.field || null, order: props.sorting.order || null });
    const localFilter = reactive(Object.assign({}, props.filters, { q: '' }));
    const loading = ref(false);
    const selectedRows = ref([]);

    function t(key) {
      if (!key) return '';
      if (typeof props.i18n === 'function') return props.i18n(key);
      if (props.i18n && typeof props.i18n === 'object') return props.i18n[key] || key;
      return key;
    }

    function renderCell(row, col) {
      if (col.render) return col.render(row);
      const val = row[col.key];
      if (col.format === 'date') return val ? new Date(val).toLocaleDateString() : '';
      if (col.format === 'currency') return new Intl.NumberFormat().format(val);
      return val == null ? '' : val;
    }

    async function fetchRemote() {
      emit('load', { page: page.value, pageSize: pageSize.value, sort: {...sort}, filters: {...localFilter} });
      loading.value = props.loading !== null ? props.loading : true;
      try {
        if (Array.isArray(props.dataSource)) {
          // client-side handling:
          let data = props.dataSource.slice();
          const q = (localFilter.q||'').toString().toLowerCase();
          if (q) data = data.filter(r => JSON.stringify(r).toLowerCase().includes(q));
          // simple filters
          for (const k of Object.keys(localFilter)) if (k!=='q' && localFilter[k]) {
            data = data.filter(r => (r[k]+'').toLowerCase().includes((localFilter[k]+'').toLowerCase()));
          }
          if (sort.field) data.sort((a,b) => {
            const A = a[sort.field], B = b[sort.field];
            if (A==null) return 1; if (B==null) return -1;
            return ((A>B)?1:-1) * (sort.order==='asc'?1:-1);
          });
          total.value = data.length;
          const start = (page.value-1)*pageSize.value;
          rows.value = data.slice(start, start+pageSize.value);
        } else if (typeof props.dataSource === 'function') {
          const resp = await props.dataSource({ page: page.value, pageSize: pageSize.value, sort:{...sort}, filters:{...localFilter} });
          rows.value = resp.items || resp.data || resp;
          total.value = resp.total || (Array.isArray(rows.value) ? rows.value.length : 0);
        } else if (typeof props.dataSource === 'string') {
          const url = new URL(props.dataSource, window.location.origin);
          url.searchParams.set('page', page.value);
          url.searchParams.set('pageSize', pageSize.value);
          if (sort.field) { url.searchParams.set('sortField', sort.field); url.searchParams.set('sortOrder', sort.order); }
          for (const k of Object.keys(localFilter)) if (localFilter[k]) url.searchParams.set(k, localFilter[k]);
          const res = await fetch(url.toString(), { credentials: 'same-origin' });
          const json = await res.json();
          rows.value = json.items || json.data || json;
          total.value = json.total || (Array.isArray(rows.value) ? rows.value.length : 0);
        }
        emit('loaded', { rows: rows.value, total: total.value });
      } catch (err) {
        console.error(err);
        emit('error', err);
      } finally {
        if (props.loading === null) loading.value = false;
      }
    }

    // events from DataTable
    function onPage(e) {
      page.value = Math.floor(e.first / e.rows) + 1;
      pageSize.value = e.rows;
      fetchRemote();
    }
    function onSort(e) {
      sort.field = e.sortField;
      sort.order = e.sortOrder === 1 ? 'asc' : 'desc';
      fetchRemote();
    }
    function onSelectionChange(e) {
      selectedRows.value = e.value;
      emit('select', selectedRows.value);
    }

    function onAction(act, row) {
      if (act.confirm && !confirm(act.confirm)) return;
      emit('action', { action: act.name, row });
    }

    function onPageSizeChange() {
      page.value = 1;
      fetchRemote();
    }

    let debounceTimer = null;
    function debouncedLoad() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => { page.value = 1; fetchRemote(); }, 300);
    }

    watch(() => props.dataSource, () => { page.value = 1; fetchRemote(); }, { immediate: true, deep: true });

    // initial load
    fetchRemote();

    return {
      rows, total, page, pageSize, pageSizes, sort, localFilter, loading, selectedRows,
      t, renderCell, onPage, onSort, onSelectionChange, onAction, onPageSizeChange, debouncedLoad
    };
  }
};
</script>

<template>
  <div class="pv-data-list">
    <h1>ESTO ES UNA LISTA DE RELIGIONES</h1>
    <Toolbar class="mb-2">
      <template #start>
        <InputText v-if="enableSearch" v-model="localFilter.q" placeholder="Buscar..." @input="debouncedLoad" class="mr-2" />
        <Button v-if="toolbar?.create" label="Crear" icon="pi pi-plus" @click="$emit('action',{ action:'create' })" />
      </template>
      <template #end>
        <slot name="toolbar-end"></slot>
      </template>
    </Toolbar>

    <DataTable
        :value="rows"
        :lazy="true"
        :paginator="true"
        :rows="pageSize"
        :totalRecords="total"
        :first="(page-1)*pageSize"
        :sortField="sort.field"
        :sortOrder="sort.order==='asc' ? 1 : -1"
        :selection="selectedRows"
        selectionMode="multiple"
        @page="onPage"
        @sort="onSort"
        @selection-change="onSelectionChange"
        dataKey="id"
        :loading="loading"
        responsiveLayout="scroll"
        class="pv-table"
    >
      <Column selectionMode="multiple" style="width: 3rem"></Column>

      <Column
          v-for="col in columns"
          :key="col.key"
          :field="col.key"
          :header="t(col.label)"
          :sortable="!!col.sortable"
          :style="{ width: col.width || null }"
          :body="(row) => renderCell(row, col)"
      />

      <Column header="Acciones" style="width: 10rem">
        <template #body="slotProps">
          <slot name="row-actions" :row="slotProps.data">
            <Button v-for="act in actions" :key="act.name" class="mr-1" :icon="act.icon" :label="act.label"
                    @click="onAction(act, slotProps.data)" :disabled="act.disabled && act.disabled(slotProps.data)" />
          </slot>
        </template>
      </Column>
    </DataTable>

    <div class="pv-footer mt-2 flex align-items-center justify-content-between">
      <div>
        <Button v-if="selectedRows.length" label="Acciones masivas" icon="pi pi-cog" @click="$emit('bulk-action',{ action:'bulk', rows:selectedRows })" />
      </div>
      <div>
        <span class="mr-2">Mostrar</span>
        <Dropdown :options="pageSizes" v-model="pageSize" @change="onPageSizeChange" style="width:5rem" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pv-data-list .mb-2 { margin-bottom: .5rem; }
.pv-table :global(.p-datatable) { width: 100%; }
.pv-footer { display:flex; align-items:center; gap:1rem; }
</style>