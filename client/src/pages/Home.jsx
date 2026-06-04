import { useState } from 'react'
import Reader from '../components/Reader/Reader'

export default function Home() {
  const [filter, setFilter] = useState('all')
  return <Reader filter={filter} onFilterChange={setFilter} />
}
