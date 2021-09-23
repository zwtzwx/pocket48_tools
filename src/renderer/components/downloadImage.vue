<template>
  <div class="download-images-container">
    <a-modal v-model="downloadVisible" title="下载图片"
      dialogClass="download-image-dialog"
      :footer="null">
      <div class="download-item">
        <div>
          <span class="label">封面图片</span>
          <img :src="coverImage" class="img-cover"
            @click="onPreview(coverImage)" />
        </div>
        <a-button type="link" @click="onDownloadImage(coverImage)">下载</a-button>
      </div>
      <div class="download-item" v-for="(item, index) in carousels"
        :key="item">
        <div>
          <span class="label">直播背景图{{ index + 1 }}</span>
          <img :src="item" class="img-cover"
            @click="onPreview(item)" />
        </div>
        <a-button type="link" @click="onDownloadImage(item)">下载</a-button>
      </div>
    </a-modal>
    <a-modal :footer="null" title="预览图片" :width="600"
      v-model="previewVisible" dialogClass="preview-dialog">
        <img :src="previewUrl" class="img-preview" />
    </a-modal>
  </div>
</template>
<script>
import { Modal } from 'ant-design-vue';
export default {
  data() {
    return {
      previewVisible: false,
      previewUrl: ''
    }
  },
  props: {
    coverImage: {
      type: String,
      default: ''
    },
    carousels: {
      type: Array,
      default: []
    },
    show: {
      type: Boolean,
      require,
      default: false
    },
  },
  methods: {
    onPreview(url) {
      this.previewUrl = url;
      this.previewVisible = true;
    },
    onDownloadImage(url) {
      this.$emit('onDownloadImage', url);
    }
  },
  computed: {
    downloadVisible: {
      set(newValue) {
        this.$emit('update:show', newValue);
      },
      get() {
        return this.show;
      }
    }
  },
  components: {
    AModal: Modal
  }
}
</script>
<style lang="scss">
.download-image-dialog {
  .download-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }
  .label {
    display: inline-block;
    width: 80px;
  }
  .img-cover {
    width: 80px;
    margin-left: 10px;
    cursor: pointer;
  }
}
.preview-dialog {
  text-align: center;
  .img-preview {
    max-width: 500px;
  }
}
</style>