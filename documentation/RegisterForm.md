# documentation du register form

émet "dataFormRegister"

quand on veut récupérer : 

Dans script :

import Form from '@/components/RegisterForm.vue'

const fct = (payload) => {}

payload = les données du form

Dans le template : 

<Form @dataFormRegister="fct"></Form>