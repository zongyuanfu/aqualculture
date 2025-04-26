import Keyboard from './Keyboard'
import LineMarker from './LineMarker'
import MixChart from './MixChart'
import resize from './mixins/resize'

// Create a Chart component that wraps echarts functionality
export const Chart = {
  name: 'Chart',
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  mixins: [resize],
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    init() {
      // Import echarts dynamically to avoid SSR issues
      const echarts = require('echarts')
      require('echarts/theme/macarons') // echarts theme

      this.chart = echarts.init(this.$el, 'macarons')
      return this.chart
    },
    setOption(option) {
      this.chart.setOption(option)
    }
  },
  render(h) {
    return h('div', {
      class: this.className,
      style: {
        height: this.height,
        width: this.width
      },
      ref: 'chart'
    })
  }
}

export default {
  Keyboard,
  LineMarker,
  MixChart,
  Chart
}
