import StatsBox from './StatsBox';
import StatsHistogram from './StatsHistogram';

const Stats = (props) => {
  const { stats, isDarkMode } = props;
  return (
    <>
      <StatsBox stats={stats} isDarkMode={isDarkMode} />
      <StatsHistogram stats={stats} isDarkMode={isDarkMode} />
    </>
  );
}

export default Stats;