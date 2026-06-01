using System.Windows;
using System.Windows.Controls;

namespace Chroma
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            
            // Set initial active tab
            MainViewStack.SelectedIndex = 0;
        }

        private void BtnNav_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag != null)
            {
                if (int.TryParse(btn.Tag.ToString(), out int index))
                {
                    // Switch active tab page programmatically
                    MainViewStack.SelectedIndex = index;
                }
            }
        }
    }
}
