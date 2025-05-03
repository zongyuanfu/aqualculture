<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          保存草稿
        </el-button>
        <el-button v-loading="loading" type="info" @click="cancelForm">
          取消
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <Warning />

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                报告标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="12">
                  <el-form-item label-width="120px" label="撰写人:" class="postInfo-container-item" prop="operator_id">
                    <el-select v-model="postForm.operator_id" filterable placeholder="选择撰写人">
                      <el-option
                        v-for="item in operatorOptions"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label-width="120px" label="创建时间:" class="postInfo-container-item">
                    <el-date-picker
                      v-model="postForm.created_at"
                      type="datetime"
                      format="yyyy-MM-dd HH:mm:ss"
                      placeholder="选择日期和时间"
                      :disabled="isEdit"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <div class="editor-label">报告内容：</div>
          <Tinymce ref="editor" v-model="postForm.content" :height="400" :toolbar="simpleToolbar" :menubar="'format table'" />
        </el-form-item>

        <el-form-item prop="status" label="状态" label-width="120px" style="margin-bottom: 30px;">
          <el-radio-group v-model="postForm.status">
            <el-radio label="published">发布</el-radio>
            <el-radio label="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchLog, createLog, updateLog } from '@/api/log'
import { fetchOperators } from '@/api/log'
import Warning from './Warning'

const defaultForm = {
  status: 'draft',
  title: '', // 报告标题
  content: '', // 报告内容
  operator_id: undefined, // 撰写人ID
  created_at: new Date(), // 创建时间
  id: undefined
}

export default {
  name: 'ArticleDetail',
  components: { Tinymce, MDinput, Sticky, Warning },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必填项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必填项'))
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      operatorOptions: [],
      simpleToolbar: ['bold italic underline strikethrough | alignleft aligncenter alignright | formatselect fontselect fontsizeselect | forecolor backcolor | bullist numlist | image media link table | removeformat fullscreen'],
      rules: {
        title: [{ required: true, validator: validateRequire, trigger: 'blur' }],
        content: [{ required: true, validator: validateRequire, trigger: 'blur' }],
        operator_id: [{ required: true, validator: validateRequire, trigger: 'change' }]
      },
      tempRoute: {}
    }
  },
  created() {
    // 获取操作员列表
    this.getOperators()

    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    // 为什么需要复制this.$route？
    // 因为如果你进入此页面并快速切换标签，可能在执行setTagsViewTitle函数时，this.$route不再指向当前页面
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    getOperators() {
      fetchOperators().then(response => {
        this.operatorOptions = response.data
      }).catch(err => {
        console.error('获取操作员列表失败:', err)
        this.$notify({
          title: '错误',
          message: '获取操作员列表失败',
          type: 'error',
          duration: 2000
        })
      })
    },
    fetchData(id) {
      // 确保id存在且为数字
      if (!id || isNaN(parseInt(id))) {
        this.$notify({
          title: '错误',
          message: '无效的日志ID',
          type: 'error',
          duration: 2000
        })
        return
      }

      // 转换为数字类型
      const numId = parseInt(id)
      this.loading = true

      fetchLog(numId).then(response => {
        // 检查响应结构，处理可能的嵌套data情况
        const logData = response.data && response.data.data ? response.data.data : response.data

        if (logData) {
          // 将API返回的数据赋值给表单
          this.postForm = Object.assign({}, this.postForm, logData)

          // 设置tagsview标题
          this.setTagsViewTitle()

          // 设置页面标题
          this.setPageTitle()
        } else {
          this.$notify({
            title: '警告',
            message: '未找到日志数据',
            type: 'warning',
            duration: 2000
          })
        }
        this.loading = false
      }).catch(err => {
        console.error('获取日志详情错误:', err)
        this.$notify({
          title: '错误',
          message: '获取日志详情失败',
          type: 'error',
          duration: 2000
        })
        this.loading = false
      })
    },
    setTagsViewTitle() {
      const title = this.isEdit ? '编辑日志' : '新建日志'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id || '新日志'}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = this.isEdit ? '编辑日志' : '新建日志'
      document.title = `${title} - ${this.postForm.id || '新日志'}`
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.postForm.status = 'published'
          const method = this.isEdit ? updateLog : createLog
          method(this.postForm).then(response => {
            this.$notify({
              title: '成功',
              message: '日志提交成功',
              type: 'success',
              duration: 2000
            })
            this.loading = false
            // 返回列表页并强制刷新列表数据
            this.$router.push({ path: '/log/list', query: { refresh: new Date().getTime() }})
          }).catch(err => {
            console.error('提交日志失败:', err)
            this.loading = false
            this.$notify({
              title: '错误',
              message: '提交失败',
              type: 'error',
              duration: 2000
            })
          })
        } else {
          this.$message({
            message: '请填写所有必填字段',
            type: 'warning'
          })
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.title.length === 0) {
        this.$message({
          message: '请至少填写标题',
          type: 'warning'
        })
        return
      }
      this.loading = true
      this.postForm.status = 'draft'
      const method = this.isEdit ? updateLog : createLog
      method(this.postForm).then(response => {
        if (!this.isEdit) {
          this.postForm.id = response.data.id
        }
        this.$message({
          message: '保存草稿成功',
          type: 'success',
          showClose: true,
          duration: 1000
        })
        this.loading = false
        // 设置tagsview标题
        this.setTagsViewTitle()
      }).catch(err => {
        console.error('保存草稿失败:', err)
        this.loading = false
        this.$notify({
          title: '错误',
          message: '保存草稿失败',
          type: 'error',
          duration: 2000
        })
      })
    },
    cancelForm() {
      this.$confirm('确定要取消编辑吗？未保存的内容将丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push('/log/list')
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 20px;

      .postInfo-container-item {
        float: left;
      }
    }

    .editor-label {
      font-size: 15px;
      color: #606266;
      margin-bottom: 10px;
      font-weight: 500;
    }
  }
}
</style>
