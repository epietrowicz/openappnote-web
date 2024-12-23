export default function BomView ({ data }) {
  return (
    <table className='table table-xs table-pin-rows table-pin-cols'>
      <thead>
        <tr>
          <th>Reference</th>
          <td>Value</td>
          <td>Quantity</td>
          <td>Footprint</td>
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <th>{r?.Reference}</th>
            <td>{r?.Value}</td>
            <td>{r?.Qty}</td>
            <td>{r?.Footprint}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
