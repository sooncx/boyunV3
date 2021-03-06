<template>
  <a-modal v-model:visible="show" :maskClosable="false" :title="title" width="750px" @ok="handleOk">
    <template #footer>
      <a-button key="back" @click="handleback">
        返回
      </a-button>
      <a-button key="submit" type="primary" :loading="modalLoading" @click="handleOk">
        提交
      </a-button>
    </template>
    <a-form :model=form ref="ruleForm" :rules="rules" class="modelsff" >
      <div class="row">
        <a-form-item ref="name" label="人员姓名" name="name">
          <a-input v-model:value.trim="form.name" placeholder="请填写真实姓名" />
        </a-form-item>
        <a-form-item ref="phone" label="联系方式" name="phone">
          <a-input v-model:value.trim="form.phone" placeholder="请填写联系方式" />
        </a-form-item>
      </div>
      <div class="row">
        <a-form-item ref="username" label="账号" name="username">
          <a-input v-model:value.trim="form.username" placeholder="请填写账号，首字母英文" />
        </a-form-item>
        <a-form-item ref="password" label="密码" name="password">
          <a-input v-model:value.trim="form.password" placeholder="英文或者数组，6-12位"  />
        </a-form-item>
      </div>
      <div class="row remark">
        <a-form-item ref="remark" label=" 备注信息" name="remark">
          <a-textarea
            v-model:value.trim="form.remark"
            placeholder=""
          />
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent,reactive, computed,toRefs,watch,PropType} from "vue";
import { ElMessage } from "element-plus";
import API from "@/api/manageData";
import { modalTypeEnum } from '@/enums/manageDataEnum';
interface installWorker {
  name: string,
  phone: string,
  username: string,
  password: string,
  remark: string,
  userId?:number,
}
export default defineComponent({
  name: "installWorkerModal",
  props: {
    // 安装人员数据
    dataItem: {
      type: [Object] as PropType<installWorker>,
      default : {
        userId: 0,                // 安装人员ID
        name: '',                 // 名字
        phone: '',                // 电话号码
        username: '',             // 登录账户
        password: '',             // 登录密码
        remark: '',               // 备注
      }
    },
    // 窗口类型 添加/修改
    type: {
      type: String,
      default : ''
    },
    // 显示状态
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // 用户名验证规则
    let validateUserName = async (rule:any, value:any, callback:any) => {
      const userNameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,11}$/;
      if(value === '') return Promise.reject('长度3-12位,首字母英文+英文字母和数字');
      if(userNameRegex.test(value)) return Promise.resolve();
      return Promise.reject('长度3-12位,首字母英文+英文字母和数字');
      
    };
    // 密码验证规则
    let validatePassword = async (rule:any, value:any, callback:any) => {
      const regex = /^[a-zA-Z0-9_]{6,12}$/;
      if(value === '') return Promise.reject('长度6-12位，英文字母+数字');
      if(regex.test(value)) return Promise.resolve();
      return Promise.reject('长度6-12位，英文字母+数字');
    }
    // 电话号码验证规则
    let validatePhone = async (rule:any, value:any, callback:any) => {
      const regex = /^(\\+?0?86\\-?)?1[3456789]\d{9}$/;
      if(value === '') return Promise.reject('目前只支持中国大陆的手机号码');
      if(regex.test(value)) return Promise.resolve();
      return Promise.reject('目前只支持中国大陆的手机号码');
    }


    const data = reactive({
      modalLoading: false,
      title: '',                                    // 窗口标题
      form: {
        userId: <number | undefined>0,
        name: '',
        phone: '',
        username: '',
        password: '',
        remark: '',
      },
      ruleForm: null as any,                        // 验证表单FORM
      rules: {
        name: [
          { required: true, message: '请输入人员姓名',  trigger: 'blur' },
          { min: 2, message: '姓名2~4个字符', trigger: 'change' },
        ],
        phone: [{ required: true,validator: validatePhone, trigger: 'change' }],
        username: [{ required: true,validator: validateUserName, trigger: 'change' }],
        password: [{ required: true,validator: validatePassword, trigger: 'change' },],
      },
    });

    // 提交数据
    const handleOk = () =>{
      data.modalLoading = true;
      data.ruleForm.validate().then(async () => {
        try{
          let code = 3;
          let error = '';
          // 判断是否添加
          if(props.type === modalTypeEnum.ADD){
            const { msg,flag } = await API.saveInstallWorker(data.form);
            code = flag; error = msg;
          }else{
            const { msg,flag } = await API.updateInstallWorker(data.form);
            code = flag; error = msg;
          }
          if(code !== 1) throw error;
          emit('installWorkerHandOk',props.type);
          emit("update:visible", false);
        }catch(e){
          ElMessage.error(e.msg);
        }
      });
      data.modalLoading = false;
    }
    const handleback = () => {
      emit("update:visible", false);
    }

    const show = computed({
      get: () => props.visible,
      set: (val) => {
        emit("update:visible", val);
      },
    });

    watch(()=>props.visible,(value)=>{
      if(!value) return;
      data.title = props.type === modalTypeEnum.ADD? '新建人员' : '修改人员' ;
      data.form.name = '';
      data.form.phone = '';
      data.form.username = '';
      data.form.password = '';
      data.form.remark = '';
      if(props.type !== modalTypeEnum.ADD){
        data.form.userId = props.dataItem.userId;
        data.form.name = props.dataItem.name;
        data.form.phone = props.dataItem.phone;
        data.form.username = props.dataItem.username;
        data.form.password = props.dataItem.password;
        data.form.remark = props.dataItem.remark;
      }
    });
    return {
      show,
      handleOk,
      handleback,
      ...toRefs(data),
    };
  },
});
</script>
<style lang="less" scoped>
.modelsff {
  .row{
    display: flex;
    flex-wrap: wrap;
    input,textarea{
      width: 250px;
    }
    .ant-form-item-label > label{
      color:#333333;
    }
    .ant-form-item{
      justify-content: flex-end;
    }
  }
  .remark { 
    .ant-form-item{
      width: 100%;
    }
    textarea{
      width: 600px;
    }
  }
}
::v-deep(.ant-form-item-label){
  width: 100px;
}
::v-deep(.ant-form-item-label > label){
  
  color:#333333;
}
</style>