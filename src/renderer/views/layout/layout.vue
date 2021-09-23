<template>
  <div class="layout-container">
    <a-layout class="layout">
      <a-layout-sider>
        <sider />
      </a-layout-sider>
      <a-layout>
        <a-layout-content class="content-container">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </a-layout-content>
        <a-layout-footer class="text-center">
          <div>V 0.0.1</div>
          <div>Author：塞纳河养猪场员工</div>
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import { Layout } from 'ant-design-vue'
import Sider from '@/components/asider.vue'
export default {
  components: {
    Sider,
    ALayout: Layout,
    ALayoutSider: Layout.Sider,
    ALayoutContent: Layout.Content,
    ALayoutFooter: Layout.Footer
  }
}
</script>

<style lang="scss">
.layout {
  min-height: 100vh;
  .version {
    position: absolute;
    color: #FFF;
    bottom: 30px;
    left: 50%;
    font-size: 26px;
    transform: translateX(-50%);
  }
  .content-container {
    padding: 20px 20px 0 20px;
  }
}
</style>