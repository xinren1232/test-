import fs from 'fs';

// 创建 NotFound.vue 文件
const notFoundContent = <template>
  <div class='not-found-page'>
    <h1>404</h1>
    <h2>页面未找到</h2>
    <p>抱歉，您访问的页面不存在或已被移除</p>
    <router-link to='/'>返回首页</router-link>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.not-found-page {
  text-align: center;
  padding: 50px;
}
</style>;

fs.writeFileSync('src/pages/NotFound.vue', notFoundContent, 'utf8');
console.log('NotFound.vue 文件已创建');
