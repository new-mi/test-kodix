const urlData = 'https://rawgit.com/Varinetz/e6cbadec972e76a340c41a65fcc2a6b3/raw/90191826a3bac2ff0761040ed1d95c59f14eaf26/frontend_test_table.json'

class Dropdown {
  constructor(element) {
    if (!element) return
    this.$el = element
    this.$head = this.$el.querySelector('[data-ddwn-head]')
    this.$input = this.$head.querySelector('[data-ddwn-input]')
    this.$title = this.$head.querySelector('[data-ddwn-title]')
    this.$options = this.$el.querySelectorAll('[data-ddwn-option]')

    this.current = null
    this.isShow = false

    this.setup()
  }

  setup() {
    this.$head.addEventListener('click', this.handleClick.bind(this))
    this.$options.forEach(item => {
      item.addEventListener('click', this.handleClickItem.bind(this, item))
    })
    document.addEventListener('click', this.handleOutside.bind(this))
  }

  updateShow() {
    this.isShow = !this.isShow
    this.$el.classList.toggle('is-active')
  }

  updateItems(item) {
    this.$options.forEach(el => {
      if (el === item) {
        el.classList.add('is-selected')
        this.current = el
        this.updateHead()
      } else {
        el.classList.remove('is-selected')
      }
    })
  }

  updateHead() {
    if (this.current) {
      this.$title.innerHTML = this.current.innerHTML
      this.$input.value = this.current.getAttribute('data-ddwn-option')
    } else {
      this.current = this.$options[0]
      this.updateHead()
    }
  }

  setDefault() {
    this.current = null
    this.updateHead()
  }

  handleClick(e) {
    this.updateShow()
  }

  handleClickItem(item, e) {
    this.updateItems(item)
    this.updateShow()
  }

  handleOutside(e) {
    if (!this.$el.contains(e.target) && this.isShow) {
      this.updateShow()
    }
  }
}

class CarList{

  static dataStatus = {
    'in_stock': 'В наличии',
    'pednding': 'Ожидается',
    'out_of_stock': 'Нет в наличии'
  }

  constructor(element, url) {
    if (!element) return;
    this.$el = element
    this.url = url || null
    this.data = []

    this.setup()
  }

  setup() {
    if (this.url) {
      this.fetchData()
    }
  }

  fetchData() {
    fetch(this.url)
      .then(res => res.json())
      .then(d => {
        this.data = d
        this.render()
      })
      .catch(err => {
        console.error(err);
      })
  }

  addCar(car) {
    if (!car) return;

    this.data.push(car)
    this.$el.appendChild(this.renderItem(car))
  }

  removeCar(id) {
    this.data = this.data.filter(el => el.id !== id)

    this.$el.removeChild(document.querySelector(`.table__item[data-id="${id}"]`))
  }

  renderItem(item) {
    if (!item) return ''

    const tr = document.createElement('tr')
    tr.classList.add('table__item')
    tr.setAttribute('data-id', item.id)
    tr.innerHTML = `
        <td class="table__name">
          <span>${item.title}</span>
          <ul>
            <li>${item.description}</li>
          </ul>
        </td>
        <td class="table__year">${item.year}</td>
        <td class="table__color">
          <span class="color color_${item.color}"></span>
        </td>
        <td class="table__status">${CarList.dataStatus[item.status]}</td>
        <td class="table__price">${toDivideInput(item.price)} руб.</td>
        <td class="table__actions">
          <button class="table__delete" data-action="delete" data-id="${item.id}">Удалить</button>
        </td>
      `
    tr.addEventListener('click', this.handleDelete.bind(this))

    return tr
  }

  render() {
    this.data.map(d => {
      this.$el.appendChild(this.renderItem(d))
    })
  }

  handleDelete(e) {
    const target = e.target
    if (target.getAttribute('data-action') === 'delete') {
      this.removeCar(target.getAttribute('data-id'))
    }
  }
}


const form = document.forms['car']
const selectFormStatus = new Dropdown(document.getElementById('selectFormStatus'))
const carList = new CarList(document.getElementById('car-list'), urlData)

form['price'].addEventListener('input', (e) => {
  e.target.value = toDivideInput(e.target.value)
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (form['status'].value === '') {
    alert('Выберите статус')
    return;
  }
  if (carList) {
    carList.addCar({
      id: id(),
      title: form['name'].value,
      description: form['description'].value,
      color: form['color'].value,
      price: form['price'].value,
      status: form['status'].value,
      year: form['year'].value
    })
  }

  clearForm()
})


function id() {
  return '_' + Math.random().toString(36).substr(2, 9);
};
function setColorDefault() {
  const colorsInput = document.querySelectorAll('input[name="color"]')
  colorsInput.forEach(c => {
    c.checked = c.getAttribute('data-default') ? true : false
  })
}

function clearForm() {
  ['name', 'year', 'price', 'description'].forEach(type => form[type].value = '')
  setColorDefault()
  selectFormStatus.setDefault()
}

function toDivideInput(val) {
  if (typeof val === 'number') val = ''+val
  const splitVal = val.split('').reverse().filter(i => i !== ' ')
  const splitValTemp = []
  splitVal.forEach((l, index) => {
    if (index !== 0 && index % 3 === 0) {
      splitValTemp.push(' ')
    }
    splitValTemp.push(l)
  })

  return splitValTemp.reverse().join('')
}
