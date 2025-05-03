<template>
  <div class="dashboard-container">
    <aquaculture-dashboard />
  </div>
</template>

<script>
import aquacultureDashboard from './aquaculture'

export default {
  name: 'Dashboard',
  components: { aquacultureDashboard }
}
</script>
