import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BasePanel from './BasePanel.vue'

const baseProps = { borderColorClass: 'border-sky-500/20', hoverColorClass: 'hover:text-sky-500' }

describe('BasePanel', () => {
  it('mostra "Dettagli" quando è chiuso e "Nascondi" quando è espanso', () => {
    const closed = mount(BasePanel, { props: { ...baseProps, isExpanded: false } })
    expect(closed.text()).toContain('Dettagli')

    const open = mount(BasePanel, { props: { ...baseProps, isExpanded: true } })
    expect(open.text()).toContain('Nascondi')
  })

  it('emette "toggle" al click sul pulsante', async () => {
    const wrapper = mount(BasePanel, { props: { ...baseProps, isExpanded: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('renderizza il contenuto degli slot (titolo e valore)', () => {
    const wrapper = mount(BasePanel, {
      props: { ...baseProps, isExpanded: false },
      slots: { 'header-title': 'Meteo', 'main-value': '21' },
    })
    expect(wrapper.text()).toContain('Meteo')
    expect(wrapper.text()).toContain('21')
  })

  it('in stato di caricamento non mostra il contenuto reale', () => {
    const wrapper = mount(BasePanel, {
      props: { ...baseProps, isExpanded: false, isLoading: true },
      slots: { 'header-title': 'Meteo' },
    })
    expect(wrapper.text()).not.toContain('Meteo')
    expect(wrapper.text()).not.toContain('Dettagli')
  })
})
