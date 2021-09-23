<template>
  <div>
    <div class="text-center logo-box">
      <img src="static/img/user.jpg" class="img-user">
    </div>
    <a-menu
      theme="dark"
      :defaultSelectedKeys="[$route.name]"
      @click="onRouteChange"
    >
      <a-menu-item v-for="item in formatRouteMap" :key="item.name">
        <a-icon :type="item.meta.icon" />
        <span>{{ item.meta.name }}</span>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script>
import { Menu, Icon } from 'ant-design-vue'
import routes from '@/router/routes.js'
export default {
  components: {
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AIcon: Icon
  },
  methods: {
    onRouteChange({ key }) {
      this.$router.push({ name: key });
    }
  },
  computed: {
    formatRouteMap() {
      let list = [];
      routes.forEach(item => {
        if (item.meta) {
          list.push(item);
        }
      });
      return list;
    }
  }
}
</script>

<style lang="scss" scoped>
.img-user {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
.logo-box {
  padding: 30px 0 20px 0;
}

</style>